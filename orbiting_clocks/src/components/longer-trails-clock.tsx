"use client"

import { useCallback, useEffect, useState } from 'react'

export function LongerTrailsClock() {
  const [time, setTime] = useState(new Date())
  const [animationProgress, setAnimationProgress] = useState(0)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    const timer = setInterval(() => {
      setTime(new Date())
    }, 50)
    return () => clearInterval(timer)
  }, [])

  const handleKeyPress = useCallback(() => {
    setAnimationProgress(1)
  }, [])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [handleKeyPress])

  useEffect(() => {
    if (animationProgress > 0) {
      const animationTimer = setInterval(() => {
        setAnimationProgress((prev) => Math.max(0, prev - 0.02))
      }, 16)
      return () => clearInterval(animationTimer)
    }
  }, [animationProgress])

  const getColor = (baseColor: string, progress: number) => {
    const rgb = parseInt(baseColor.slice(1), 16)
    const r = (rgb >> 16) & 255
    const g = (rgb >> 8) & 255
    const b = rgb & 255

    const brightnessIncrease = 100
    const newR = Math.min(255, Math.round(r + (255 - r) * progress) + brightnessIncrease)
    const newG = Math.min(255, Math.round(g + (255 - g) * progress) + brightnessIncrease)
    const newB = Math.min(255, Math.round(b + (255 - b) * progress) + brightnessIncrease)

    return `rgb(${newR}, ${newG}, ${newB})`
  }

  const createTrail = (unit: 'seconds' | 'minutes' | 'hours', radius: number) => {
    if (!isClient) return null
    const trailLength = unit === 'seconds' ? 120 : unit === 'minutes' ? 360 : 720
    const deltaTime = unit === 'seconds' ? 100 : unit === 'minutes' ? 1000 : 5000
    const trail = []
    for (let i = 0; i < trailLength; i++) {
      const trailTime = new Date(time.getTime() - i * deltaTime)
      let angle
      if (unit === 'seconds') {
        const seconds = trailTime.getSeconds() + trailTime.getMilliseconds() / 1000
        angle = (seconds / 60) * 360
      } else if (unit === 'minutes') {
        const minutes = trailTime.getMinutes() + trailTime.getSeconds() / 60
        angle = (minutes / 60) * 360
      } else {
        const minutes = trailTime.getMinutes() + trailTime.getSeconds() / 60
        const hours = (trailTime.getHours() % 12) + minutes / 60
        angle = (hours / 12) * 360
      }
      const coords = getCoordinates(angle, radius)
      const progress = 1 - i / trailLength
      trail.push(
        <circle
          key={`${unit}-${i}`}
          cx={coords.x}
          cy={coords.y}
          r={unit === 'hours' ? 2 : 1.5}
          fill={getColor(
            unit === 'hours' ? '#FF6B6B' : unit === 'minutes' ? '#4ECDC4' : '#45B7D1',
            animationProgress * progress
          )}
          opacity={unit === 'seconds' ? Math.pow(progress, 0.5) : Math.pow(progress, 2)}
        />
      )
    }
    return trail
  }

  const getCoordinates = (angle: number, radius: number) => {
    const x = Math.sin((angle * Math.PI) / 180) * radius
    const y = -Math.cos((angle * Math.PI) / 180) * radius
    return { x, y }
  }

  if (!isClient) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  const seconds = time.getSeconds() + time.getMilliseconds() / 1000
  const secondsAngle = (seconds / 60) * 360
  const secondsCoords = getCoordinates(secondsAngle, 180)

  const minutes = time.getMinutes() + seconds / 60
  const minutesAngle = (minutes / 60) * 360
  const minutesCoords = getCoordinates(minutesAngle, 140)

  const hours = (time.getHours() % 12) + minutes / 60
  const hoursAngle = (hours / 12) * 360
  const hoursCoords = getCoordinates(hoursAngle, 100)

  return (
    <div className="flex items-center justify-center h-screen">
      <svg width="600" height="600" viewBox="-200 -200 400 400">
        <circle r="180" fill="none" stroke="white" strokeWidth="1" opacity="0.3" />
        <circle r="140" fill="none" stroke="white" strokeWidth="1" opacity="0.3" />
        <circle r="100" fill="none" stroke="white" strokeWidth="1" opacity="0.3" />

        {createTrail('seconds', 180)}
        {createTrail('minutes', 140)}
        {createTrail('hours', 100)}

        <circle cx={secondsCoords.x} cy={secondsCoords.y} r="5" fill={getColor('#45B7D1', animationProgress)} />
        <circle cx={minutesCoords.x} cy={minutesCoords.y} r="7" fill={getColor('#4ECDC4', animationProgress)} />
        <circle cx={hoursCoords.x} cy={hoursCoords.y} r="9" fill={getColor('#FF6B6B', animationProgress)} />
      </svg>
    </div>
  )
}
