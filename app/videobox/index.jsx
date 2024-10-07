import React, { useState, useEffect } from 'react';
import { Button, Typography, Box, Alert, LinearProgress, Select, MenuItem, FormControl, InputLabel, FilledInput, OutlinedInput } from '@mui/material';
import { FileUploadOutlined, RestartAlt, Assessment } from '@mui/icons-material'; // Updated import
import NoSsr from '@mui/base/NoSsr'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
import SendIcon from '@mui/icons-material/Send'

import useVideobox from './useVideobox.js'
import classes from '../chatbox.module.css'

const VideoBox = () => {

  const { analyzeVideo, error, progress, videoFile, setVideoFile } = useVideobox()
  const [videoUrl, setVideoUrl] = useState(null);  // Add this line

  const [isDragging, setIsDragging] = useState(false); 

  const [model, setModel] = useState('')
  const inputRef = React.useRef(null)
  const [inputText, setInputText] = React.useState('')

  useEffect(() => {
    // Clean up the object URL when the component unmounts or when videoFile changes
    return () => {
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, [videoUrl]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    handleNewFile(file);
  };

  const handleDrop = (event) => {
    event.preventDefault(); // Prevent default behavior
    const file = event.dataTransfer.files[0];
    handleNewFile(file);
  };

  const handleNewFile = (file) => {
    if (file && file.type.startsWith('video/')) {
      setVideoFile(file);
      // Revoke the old URL if it exists
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
      // Create a new URL
      const newVideoUrl = URL.createObjectURL(file);
      setVideoUrl(newVideoUrl);
    } else {
      alert('Please upload a valid video file.');
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault(); // Prevent default behavior
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

  const handleVideo = async (e, model) => {
    e?.preventDefault()
    if(!model){
      alert("select a model to analyze the video.")
    }
    console.log('Before analyzeVideo:', videoFile); // Log before analyzing
    await analyzeVideo(inputText, model);
    console.log('After analyzeVideo:', videoFile); // Log after analyzing
  };

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
        hidden={progress > 0 && progress < 100}
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
      {videoUrl && videoFile && (
        <video 
          controls
          key={videoUrl} 
          autoPlay={true}
          src={videoUrl}
          style={{ width: '100%', marginBottom: '20px' }} 
        />
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
            The video has been analysed successfully. Please continue in the chat section with your questions about the video.
          </Alert>
        </Box>
        : null
      }
      {
        videoFile && (
          <NoSsr>
              <Box 
              component="form" 
              autoComplete='off'
              className={classes.box}
              onSubmit={handleVideo}
              sx={{bgcolor: 'white', borderRadius: '4px!important', mt: 2}}
              noValidate>
                  <TextField 
                  autoFocus={true}
                  placeholder={`Type the prompt...`}
                  disabled={Boolean(progress)}
                  className={classes.inputField}
                  fullWidth
                  //multiline
                  //maxRows={4}
                  inputRef={inputRef}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  InputProps={{
                      endAdornment: (
                          <InputAdornment position="end">
                              <React.Fragment>
                                  {/* <IconButton
                                    
                                    onClick={handleVideo}
                                    data-testid="send-button"
                                    style={{ 
                                        border: '1px solid #ccc', 
                                        padding: '5px', 
                                        color: progress || inputText.length === 0 ? 'lightgray' : '#fff', 
                                        backgroundColor: progress || inputText.length === 0 ? '#f0f0f0' : '#007bff', 
                                        borderRadius: '5px' 
                                    }}
                                  >
                                      <span style={{ fontSize: '0.7em', marginRight: '5px', color: progress || inputText.length === 0 ? 'lightgray' : '#fff' }}>Send</span>
                                      <SendIcon style={{ color: progress || inputText.length === 0 ? 'lightgray' : '#fff' }} />
                                  </IconButton> */}
                                  <FormControl 
                                    sx={{minWidth: 95}} 
                                    size='small' 
                                    disabled={Boolean(progress) || inputText.length === 0}
                                  >
                                    <Select
                                      displayEmpty
                                      labelId="send-via-label"
                                      input={<OutlinedInput />}
                                      id="send-via-select"
                                      value={model}
                                      renderValue={(value)=> `Sent to ${value || ''}`}
                                      // MenuProps={MenuProps}
                                      inputProps={{ 'aria-label': 'Without label' }}
                                      sx={{
                                        background: '#007bff', 
                                        color: 'white',
                                        '& .MuiSvgIcon-root': {
                                          color: 'white'
                                        },
                                        '&.Mui-disabled': {
                                          background: 'lightgray',
                                          opacity: .5,
                                          '& .MuiSvgIcon-root': {
                                            color: 'inherit'
                                          },
                                        }
                                      }}
                                      onChange={(e) => {setModel(e.target.value); handleVideo(e, e.target.value)}}
                                    >
                                      <MenuItem value={'YOLO'}>YOLO</MenuItem>
                                      <MenuItem value={'SAM2'}>SAM2</MenuItem>
                                    </Select>
                                  </FormControl>
                              </React.Fragment>
                          </InputAdornment>
                      ),
                  }}
                  />
              </Box>
          </NoSsr>
        )
      }
    </Box>
  );
};

export default VideoBox;