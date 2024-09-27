import React, { useState } from 'react';
import { Button, Typography, Box } from '@mui/material';
import { FileUploadOutlined, RestartAlt, Send } from '@mui/icons-material';

const VideoBox = () => {
  const [videoFile, setVideoFile] = useState(null);
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

  return (
    <Box 
      sx={{ 
        px: 4, 
        textAlign: 'center', 
        height: '100%',
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
            src={URL.createObjectURL(videoFile)} 
            style={{ width: '100%' }} 
          />
        </>
      )}
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
              textAlign: 'end'
            }}
          >
            <Send fontSize='large' sx={{verticalAlign: 'middle'}} />
          </Box>
        )
      }
    </Box>
  );
};

export default VideoBox;