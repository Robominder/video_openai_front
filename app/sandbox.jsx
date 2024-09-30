'use client'

import React, { useState } from 'react'

import { Divider } from '@mui/material'
import VideoBox from './videobox'
import ChatBox from './chatbox'


export default function Sandbox() {
    const [leftWidth, setLeftWidth] = useState(35); // Initial width percentage

    const handleMouseMove = (e) => {
        const newWidth = (e.clientX / window.innerWidth) * 100;
        setLeftWidth(newWidth);
    };

    return (
        <div style={{ display: 'flex', height: '100vh' }}>
            <div style={{ width: `${leftWidth}%`, overflow: 'hidden' }}>
                <VideoBox />
            </div>
            <Divider
                orientation="vertical"
                sx={{
                    cursor: 'ew-resize',
                    width: '1px',
                    height: '100%',
                    zIndex: 1,
                    bgcolor: "#888",
                }}
                onMouseDown={(e) => {
                    document.addEventListener('mousemove', handleMouseMove);
                    document.addEventListener('mouseup', () => {
                        document.removeEventListener('mousemove', handleMouseMove);
                    }, { once: true });
                }}
            />
            <div style={{ width: `${100 - leftWidth}%`, overflow: 'hidden' }}>
                <ChatBox />
            </div>
        </div>
    )
}