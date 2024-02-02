import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export class FileLock {
    private readonly basePath: string;
    private readonly concurrentRequests: boolean;
    private waiting: Array<() => void> = [];
    private readonly lockfileMaxLifetimeInMinutes: number = 5;

    constructor(concurrentRequests: string, folderName: string = 'lock_files') {
        this.deleteOldLockFile()
        this.concurrentRequests = concurrentRequests.toLowerCase() == "true";
        this.basePath = path.join(os.tmpdir(), folderName);
        if (!fs.existsSync(this.basePath)) {
            fs.mkdirSync(this.basePath);
        }
    }

    private deleteOldLockFile(folderName: string = 'lock_files', fileName: string = 'lockfile') {
        const basePath = path.join(os.tmpdir(), folderName);
        const lockFilePath = path.join(basePath, fileName);

        if (fs.existsSync(lockFilePath)) {
            const fileStats = fs.statSync(lockFilePath);
            const now = new Date().getTime();
            const fileAge = now - fileStats.mtime.getTime();

            // Check if the file is older than n minutes (n minutes * 60 seconds * 1000 milliseconds)
            if (fileAge > this.lockfileMaxLifetimeInMinutes * 60 * 1000) {
                fs.unlinkSync(lockFilePath);
                console.log("Old lock file deleted successfully.");
            } else {
                console.log("Lock file is not old enough to delete.");
            }
        } else {
            console.log("No lock file to delete.");
        }
    }


    private getLockFilePath(): string {
        return path.join(this.basePath, 'lockfile');
    }

    private attemptLock(): boolean {
        try {
            fs.openSync(this.getLockFilePath(), 'wx');
            return true; // Lock acquired
        } catch (e) {
            if (e.code !== 'EEXIST') {
                throw e; // Rethrow if error is not because the file already exists
            }
            return false; // Lock not acquired because file already exists
        }
    }

    public lock(): Promise<void> {
        return new Promise((resolve) => {
            if (this.concurrentRequests) {
                resolve();
                return;
            }

            const tryLock = () => {
                if (this.attemptLock()) {
                    resolve();
                } else {
                    this.waiting.push(tryLock);
                    setTimeout(() => {
                        const index = this.waiting.indexOf(tryLock);
                        if (index > -1) {
                            this.waiting.splice(index, 1); // Remove from queue before retrying to prevent memory leak
                        }
                        tryLock();
                    }, 100); // Retry after a short delay
                }
            };

            tryLock();
        });
    }

    public unlock(): void {
        if (this.concurrentRequests) {
            return
        }

        if (fs.existsSync(this.getLockFilePath())) {
            fs.unlinkSync(this.getLockFilePath());
            if (this.waiting.length > 0) {
                const next = this.waiting.shift();
                if (next) {
                    next();
                }
            }
        }
    }
}
