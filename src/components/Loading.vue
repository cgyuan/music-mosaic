<template>
    <div class="loading-container">
      <div class="spinner-container">
        <div></div>
        <div></div>
        <div></div>
      </div>
      <span> {{ text ?? '加载中' }} </span>
    </div>
  </template>
  
  <script lang="ts" setup>
  interface ILoadingProps {
    text?: string;
  }

 defineProps<ILoadingProps>();
  </script>
  
  <style scoped>
  .loading-container {
    width: 100%;
    height: 100%;
    min-height: 300px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: var(--textColor);
  }
  
  .spinner-container {
    display: inline-block;
    position: relative;
    width: 80px;
    height: 80px;
  }
  
  .spinner-container div {
    display: inline-block;
    position: absolute;
    left: 8px;
    width: 16px;
    background: var(--primaryColor);
    animation: spinning-animation 1.2s cubic-bezier(0, 0.5, 0.5, 1) infinite;
  }
  
  .spinner-container div:nth-child(1) {
    left: 8px;
    animation-delay: -0.24s;
  }
  
  .spinner-container div:nth-child(2) {
    left: 32px;
    animation-delay: -0.12s;
  }
  
  .spinner-container div:nth-child(3) {
    left: 56px;
    animation-delay: 0;
  }
  
  @keyframes spinning-animation {
    0% {
      top: 8px;
      height: 64px;
    }
    50%,
    100% {
      top: 24px;
      height: 32px;
    }
  }
  
  span {
    font-size: 1rem;
    user-select: none;
  }
  
  span::after {
    content: "";
    animation: text-animation 1.2s linear infinite;
  }
  
  @keyframes text-animation {
    from {
      content: " ";
    }
  
    25% {
      content: " ·";
    }
  
    50% {
      content: " ··";
    }
    
    75% {
      content: " ···";
    }
  }
  </style>
  