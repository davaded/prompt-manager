import { motion } from 'framer-motion'
import { useState } from 'react'

interface HoloWindowProps {
  children: React.ReactNode
}

// 数据粒子组件
function DataParticle({ delay }: { delay: number }) {
  const randomX = Math.random() * 100
  const randomDuration = 15 + Math.random() * 10

  return (
    <motion.div
      className="absolute w-0.5 h-0.5 bg-cyan-400 rounded-full"
      style={{ left: `${randomX}%`, bottom: 0 }}
      animate={{
        y: [0, -1000],
        opacity: [0, 1, 1, 0],
        scale: [0, 1, 1, 0]
      }}
      transition={{
        duration: randomDuration,
        delay: delay,
        repeat: Infinity,
        ease: 'linear'
      }}
    />
  )
}

export default function HoloWindow({ children }: HoloWindowProps) {
  const [particles] = useState(() =>
    Array.from({ length: 30 }, (_, i) => i)
  )

  return (
    <div className="relative w-screen h-screen flex items-center justify-center bg-[#0a0a0f] overflow-hidden">

      {/* 扫描线效果 */}
      <div className="scanline" />

      {/* 网格背景 */}
      <div className="absolute inset-0 cyber-grid opacity-40" />

      {/* 数据粒子流 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((i) => (
          <DataParticle key={i} delay={i * 0.5} />
        ))}
      </div>

      {/* 环境光晕 - 青色 */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full blur-[120px]"
        style={{
          background: 'radial-gradient(circle, rgba(0,255,255,0.15) 0%, transparent 70%)'
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
          x: [0, 50, 0],
          y: [0, -30, 0]
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />

      {/* 环境光晕 - 品红 */}
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full blur-[100px]"
        style={{
          background: 'radial-gradient(circle, rgba(255,0,255,0.12) 0%, transparent 70%)'
        }}
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.2, 0.4, 0.2],
          x: [0, -40, 0],
          y: [0, 40, 0]
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1
        }}
      />

      {/* 主窗口容器 */}
      <div className="relative w-full max-w-[95vw] h-[92vh] z-10">

        {/* 角落装饰 - 左上 */}
        <div className="absolute -top-2 -left-2 w-12 h-12 border-l-2 border-t-2 border-cyan-400/60 pointer-events-none">
          <motion.div
            className="absolute -top-0.5 -left-0.5 w-3 h-3 bg-cyan-400"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>

        {/* 角落装饰 - 右上 */}
        <div className="absolute -top-2 -right-2 w-12 h-12 border-r-2 border-t-2 border-cyan-400/60 pointer-events-none">
          <motion.div
            className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-cyan-400"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
          />
        </div>

        {/* 角落装饰 - 左下 */}
        <div className="absolute -bottom-2 -left-2 w-12 h-12 border-l-2 border-b-2 border-magenta-400/60 pointer-events-none">
          <motion.div
            className="absolute -bottom-0.5 -left-0.5 w-3 h-3 bg-magenta-400"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 2, repeat: Infinity, delay: 1 }}
          />
        </div>

        {/* 角落装饰 - 右下 */}
        <div className="absolute -bottom-2 -right-2 w-12 h-12 border-r-2 border-b-2 border-magenta-400/60 pointer-events-none">
          <motion.div
            className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-magenta-400"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
          />
        </div>

        {/* 主玻璃容器 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative w-full h-full rounded-none overflow-hidden border border-cyan-400/30 shadow-2xl"
          style={{
            background: 'linear-gradient(135deg, rgba(10,10,15,0.85) 0%, rgba(15,15,25,0.9) 100%)',
            backdropFilter: 'blur(20px)',
            boxShadow: `
              0 0 0 1px rgba(0,255,255,0.2),
              inset 0 1px 0 rgba(0,255,255,0.1),
              0 10px 50px rgba(0,0,0,0.5),
              0 0 100px rgba(0,255,255,0.1)
            `
          }}
        >
          {/* 顶部光痕 */}
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />

          {/* 内部边框光晕 */}
          <div className="absolute inset-0 border border-cyan-400/10 pointer-events-none" />

          {/* 内容区域 */}
          <div className="relative z-10 w-full h-full flex">
            {children}
          </div>
        </motion.div>
      </div>

      {/* 底部状态栏 */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 text-xs font-mono text-cyan-400/60 z-20">
        <motion.div
          className="flex items-center gap-2"
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
          <span>SYSTEM_ACTIVE</span>
        </motion.div>
        <span className="text-cyan-400/30">|</span>
        <span>HOLOGRAPHIC_INTERFACE_v2.1</span>
        <span className="text-cyan-400/30">|</span>
        <span>{new Date().toLocaleTimeString('en-US', { hour12: false })}</span>
      </div>
    </div>
  )
}
