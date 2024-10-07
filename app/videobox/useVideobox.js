import useAppStore from '../../stores/appStore'
import { getUniqueId } from '../../lib/utils'
import { useEffect, useState } from 'react'

const YOLO_HOST = 'http://194.61.20.182:8080'
const SAM2_HOST = 'http://194.61.20.182:8000'

const useVideobox = () => {
  const threadId = useAppStore((state) => state.threadId)
  const setThreadId = useAppStore((state) => state.setThreadId)

  const [videoFile, _setVideoFile] = useState(null)
  const [progress, setProgress] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(()=>{
    if (!threadId){
      setError(null)
      setProgress(0)
      setVideoFile(null)
    }
  }, [threadId])
    
  const setVideoFile = async (videoFile) => {
    if (threadId)
      await deleteThread()
    setError(null)
    setProgress(0)
    _setVideoFile(videoFile)
  }

  const analyzeVideo = async (text, model) => {
    const file = videoFile
    if (!file){
      return setError("Video file is required!")
    }

    await deleteThread()

    setProgress(1)

    setError(null)

    const formData = new FormData();
  
    // Append the video file to the form data
    formData.append('file', file);
    formData.append('text', text);
    
    const BE_HOST = model === 'SAM2' ? SAM2_HOST : YOLO_HOST

    try {
      const response = await fetch(BE_HOST+'/files/', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        let video_url = result.video_url

        checkProgress(video_url, BE_HOST)

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

  function getUniqueImageFrames(BE_HOST, data) {
    const imageSet = [];

    for (const key in data) {
        if (data.hasOwnProperty(key)) {
            data[key].forEach(item => {
                item.frame = `${BE_HOST}${item?.frame?.startsWith('.') ? item.frame.slice(1) : item.frame}`
                imageSet.push(item.frame);
            });
        }
    }

    return [imageSet?.[0], imageSet?.[imageSet.length-1]];
  }

  const checkProgress = async (video_url, BE_HOST) => {
    const response = await fetch(BE_HOST+video_url, {
      method: 'GET'
    });

    if (response.ok) {
      const result = await response.json();

      let images = getUniqueImageFrames(BE_HOST, result)
      sendToOpenAi(images, JSON.stringify(result))


    } else {
      if (response.status === 429){
        setTimeout(async ()=>{
          await checkProgress(video_url, BE_HOST)
        }, 4000)
        return 
      }
      console.error('Check status failed:', response);
      setProgress(0)
    }
  }

  const getImageUrls = () => {
    
  }
  
  const sendToOpenAi = async (images, message) => {
    try {
      console.log('submit-assistant', threadId, message)

      const message_id = getUniqueId()

      const thread_id = ''
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

  const deleteThread = async () => {
    if (!threadId)
      return

    try {

        setLoading(true)

        const response = await fetch('/assistant/thread', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ threadId: threadId })
        })

        if(!response.ok) {
            console.log('Oops, an error occurred', response.status)
        }

        const result = await response.json()

        console.log(result)

    } catch(error) {
        
        console.log(error.name, error.message)

    } finally {

        setLoading(false)
        setThreadId('')

    }
  }

  return {analyzeVideo, error, progress, videoFile, setVideoFile}
}


export default useVideobox