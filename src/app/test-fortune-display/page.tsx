/**
 * 测试签文显示组件
 */

'use client';

import { FortuneHighlight } from '@/components/chat/fortune-highlight';
import { useState } from 'react';

export default function TestFortuneDisplayPage() {
  const [showFortune, setShowFortune] = useState(true);

  const testFortune = {
    title: '流水不争先',
    text: '流水不争先，争的是滔滔不绝',
    interpretation: '意思是说，持续比一时的速度更重要。',
  };

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '20px' }}>
      <h1>🎴 签文卡片组件测试</h1>

      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={() => setShowFortune(!showFortune)}
          style={{
            padding: '10px 20px',
            background: '#FF6B6B',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          {showFortune ? '隐藏签文卡片' : '显示签文卡片'}
        </button>
      </div>

      {showFortune && (
        <FortuneHighlight>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#FF6B6B' }}>
              {testFortune.title}
            </p>
            <p style={{ fontSize: '14px', fontStyle: 'italic' }}>
              "{testFortune.text}"
            </p>
            <p style={{ fontSize: '14px', color: 'rgba(0,0,0,0.6)', marginTop: '8px' }}>
              {testFortune.interpretation}
            </p>
          </div>
        </FortuneHighlight>
      )}

      <div style={{
        marginTop: '40px',
        padding: '20px',
        background: '#f5f5f5',
        borderRadius: '12px',
        borderLeft: '4px solid #FF6B6B',
      }}>
        <p><strong>🤖 AI：</strong> 早上好！今天抽到"流水不争先"这支签，特别喜欢这个意境呢。</p>
        <p style={{ marginTop: '10px' }}>流水不争先，争的是滔滔不绝 - 意思是说，持续比一时的速度更重要。</p>
        <p style={{ marginTop: '10px' }}>今天想聊点什么？我随时在这里陪伴你 💝</p>
      </div>

      <div style={{ marginTop: '40px' }}>
        <h2>✅ 检查清单</h2>
        <ul>
          <li>是否看到签文卡片？</li>
          <li>签文卡片是否在 AI 消息之前？</li>
          <li>签文卡片是否有渐变背景？</li>
          <li>是否看到 📜 图标和"今日签文"标签？</li>
          <li>签文内容是否正确显示？</li>
        </ul>
      </div>

      <div style={{ marginTop: '40px' }}>
        <h2>🔧 如果看不到效果</h2>
        <ol>
          <li>打开浏览器控制台（F12）查看错误</li>
          <li>刷新页面（Cmd+R 或 Ctrl+R）</li>
          <li>清除浏览器缓存</li>
        </ol>
      </div>
    </div>
  );
}
