import useAppStore from '../../stores/appStore'
import { getUniqueId } from '../../lib/utils'
import { useEffect, useState } from 'react'

const BE_HOST = 'http://35.246.9.21:8000'

const useVideobox = () => {
  const threadId = useAppStore((state) => state.threadId)
  const setThreadId = useAppStore((state) => state.setThreadId)

  const [videoFile, setVideoFile] = useState(null);
  const [progress, setProgress] = useState(null)
  const [error, setError] = useState(null)


  useEffect(()=>{
    if (!threadId){
      setError(null)
      setProgress(0)
      setVideoFile(null)
    }
  }, [threadId])
    

  const analyzeVideo = async () => {
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

    try {
      const response = await fetch(BE_HOST+'/files/', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        let video_url = result.video_url

        checkProgress(video_url)

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

  function getUniqueImageFrames(data) {
    const imageSet = [];

    for (const key in data) {
        if (data.hasOwnProperty(key)) {
            data[key].forEach(item => {
                item.frame = `${BE_HOST}${item.frame}`
                imageSet.push(item.frame);
            });
        }
    }

    return [imageSet?.[0], imageSet?.[imageSet.length-1]];
  }

  const checkProgress = async (video_url) => {
    const response = await fetch(BE_HOST+video_url, {
      method: 'GET'
    });

    if (response.ok) {
      const result = await response.json();

      let images = getUniqueImageFrames(result)
      sendToOpenAi(images, JSON.stringify(result))


    } else {
      if (response.status === 429){
        setTimeout(async ()=>{
          await checkProgress(video_url)
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