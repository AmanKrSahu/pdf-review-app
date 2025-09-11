declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: string;
      PORT: string;
      BASE_PATH: string;
      MONGO_URI: string;
      FRONTEND_ORIGIN: string;
      GEMINI_API_KEY: string;
      MAX_FILE_SIZE: string;
    }
  }
  
  interface ErrorConstructor {
    captureStackTrace?(targetObject: Object, constructorOpt?: Function): void;
  }
  
  const process: NodeJS.Process;
}

export {};
