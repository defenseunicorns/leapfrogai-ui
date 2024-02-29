import { json } from '@sveltejs/kit'
import { readFile } from 'fs/promises'
import { tmpdir } from 'os'
import path from 'path'
import type { RequestEvent } from './$types'

const TEMPORARY_DIRECTORY = tmpdir()

export async function POST({ request }: RequestEvent) {
    const jsonData = await request.json()

    const uid: string | File | undefined = jsonData.uid

    let response = json({
        result: 'Incomplete'
    })

    if (!uid || uid === '') {
        console.log('\tUID returned undefined or empty')
        return response
    }

    const transcriptionFile = path.join(TEMPORARY_DIRECTORY, `${uid}.txt`)

    let transcription = undefined

    try {
        transcription = await readFile(transcriptionFile, 'utf8')
    } catch (err) {
        return response
    }

    if (!transcription || transcription === '') {
        console.log('\tTranscription returned undefined or empty')
        return response
    }

    response = json({
        result: 'Complete',
        transcription: transcription
    })

    return response
}
