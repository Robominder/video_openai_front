import useAppStore from '../../stores/appStore'
import { getUniqueId } from '../../lib/utils'
import { useState } from 'react'

const useVideobox = () => {
  const threadId = useAppStore((state) => state.threadId)
  const setThreadId = useAppStore((state) => state.setThreadId)

  const [progress, setProgress] = useState(null)
  const [error, setError] = useState(null)

  const analyzeVideo = async (file) => {
    if (!file){
      return setError("Video file is required!")
    }

    setProgress(1)

    setError(null)

    const formData = new FormData();
  
    // Append the video file to the form data
    formData.append('video', file);

    try {
      const response = await fetchMock('https://example.com/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        let frames = result.frames

        let images = frames.map((frame)=> frame.url)
        let text = frames.map((frame, ind) => `${ind+1} image: ${frame.description}`).join('\n')
        let message = `This images are the Video frames.`
          + `\n Analyze this images with their description and answer the follow up questions about the video:\n\n`
          + text

        await sendToOpenAi(images, message)
      
      } else {
        console.error('Upload failed:', response.statusText);
        setError(`Upload failed: ${response.statusText}`)
        setProgress(0)
      }
    } catch (error) {
      console.error('Error during upload:', error);
      setError(`Error during upload: ${error.message}`)
      setProgress(0)
    }
  }

  const checkProgress = () => {}
  
  const sendToOpenAi = async (images, message) => {
    try {
      console.log('submit-assistant', threadId, message)

      const message_id = getUniqueId()

      const thread_id = threadId ? threadId : ''
      const response = await fetch('/assistant/message', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            inquiry: message,
            threadId: thread_id,
            messageId: message_id,
            imageUrls: images
        })
      })

      if(!response.ok) {
        console.log('Oops, an error occurred', response.status)
        setProgress(0)
        setError("Error during OpenAI training: "+response.status)
      } else {
        const result = await response.json()
        setThreadId(result.threadId)
        setProgress(100)
      }

    } catch(error) {
      console.log(error.name, error.message)
      setProgress(0)
      setError(`Error during OpenAI training: ${error.message}`)
    }
  }

  return {analyzeVideo, error, progress}
}

const fetchMock = (videoFile) => {
  return {
    ok: true,
    json: () => ({
      frames: [
        {
          url: 'https://storage.googleapis.com/uk-boots-detection-frames/2024-09-29/EVO-Medium-closer/frame_130436.jpg',
          description: 'This is a box which is branded with the word Boots, in the middle horizontally blue line. It lookes like it is sealed correctly. boc has no deffect'
        },
        {
          url: 'https://storage.googleapis.com/uk-boots-detection-frames/2024-09-29/EVO-Medium-closer/frame_123516.jpg',
          description: 'This frame contains unpacked box which contains something in it which are blue and pink'
        },
      ]
    })
  }
}

export default useVideobox