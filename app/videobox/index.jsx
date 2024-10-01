import React, { useState } from 'react';
import { Button, Typography, Box, Alert, LinearProgress } from '@mui/material';
import { FileUploadOutlined, RestartAlt, Assessment } from '@mui/icons-material'; // Updated import

import useVideobox from './useVideobox.js'

const VideoBox = () => {

  const { analyzeVideo, error, progress, videoFile, setVideoFile } = useVideobox()

  const [isDragging, setIsDragging] = useState(false); 

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('video/')) {
      setVideoFile(file);
    } else {
      alert('Please upload a valid video file.');
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault(); // Prevent default behavior
  };

  const handleDrop = (event) => {
    event.preventDefault(); // Prevent default behavior
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('video/')) {
      setVideoFile(file);
    } else {
      alert('Please upload a valid video file.');
    }
  };

  const handleDragEnter = () => {
    setIsDragging(true); // Set dragging state
  };

  const handleDragLeave = () => {
    setIsDragging(false); // Reset dragging state
  };

  const handleBoxClick = () => {
    document.getElementById('video-upload').click(); // Trigger file input
  };

  const handleVideo = async () => {
    await analyzeVideo(videoFile)
    
  }

  return (
    <Box 
      sx={{ 
        px: 4, 
        textAlign: 'center', 
        height: '100%',
        overflowY: 'scroll',
        backgroundColor: '#10172A',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      <Box 
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onDragEnter={handleDragEnter} 
        onDragLeave={handleDragLeave} 
        onClick={handleBoxClick}
        sx={{
          p: 5, 
          backgroundColor: isDragging ? '#2c3e50' : "rgba(200, 200, 200, .1)",
          borderRadius: 3,
          mb: 5,
          cursor: 'pointer'
        }}
      >
        <input 
          type="file" 
          accept="video/*" 
          onChange={handleFileChange} 
          style={{ display: 'none' }} 
          id="video-upload" 
        />
        <FileUploadOutlined fontSize='large' sx={{alignSelf: 'center'}}/>
        <Typography variant="body1" fontSize={16}>
          Drop Video Here 
        </Typography>
        <Typography variant="body1" fontSize={16}>
          - or -
        </Typography>
        <Typography variant="body1" fontSize={16}>
          Click to Upload a New Video
        </Typography>
      </Box>
      {videoFile && (
        <>
          <video 
            controls 
            autoPlay={true}
            src={URL.createObjectURL(videoFile)} 
            style={{ width: '100%' }} 
          />
        </>
      )}
      {
        error
        ?
        <Box sx={{mt: 2}}>
          <Alert severity='error' variant='filled' sx={{borderRadius: 2}}>
            {error}
          </Alert>
        </Box>
        : null
      }
      {console.log(progress, error)}
      {
        progress > 0 && progress<100 && !error
        ? <LinearProgress sx={{mt: 2}}/>
        : null
      }
      {
        progress === 100 && !error
        ?
        <Box sx={{mt: 2}}>
          <Alert severity='success' variant='filled' sx={{borderRadius: 2, textAlign: 'left'}}>
            The video has been analised successfully. Please continue in the chat section with your questions about the video.
          </Alert>
        </Box>
        : null
      }
      {
        videoFile && (
          <Box 
            sx={{
              px: 3,
              py: 1,
              mt: 2, 
              backgroundColor: isDragging ? '#2c3e50' : "rgba(200, 200, 200, .1)",
              borderRadius: 3,
              cursor: 'pointer',
              textAlign: 'center', // Center the content
            }}
            onClick={handleVideo} // Move the onClick handler to Box
          >
            <span style={{ fontSize: '1em', marginRight: '5px', color: '#fff', verticalAlign: 'middle' }}>
              Analyse the video
            </span>
            <Assessment fontSize='large' sx={{ verticalAlign: 'middle', color: '#fff' }} /> {/* Icon without onClick */}
          </Box>
        )
      }
    </Box>
  );
};

export default VideoBox;