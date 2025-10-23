@echo off
rem -----------------------------
rem run_with_portable_npm_WINDOWS.bat
rem -----------------------------
setlocal

set PORTABLE_DIR=portable_node

if not exist "%PORTABLE_DIR%\node.exe" (
  echo Error: %PORTABLE_DIR%\node.exe not found. Run install_portable_npm_WINDOWS.bat first.
  exit /b 1
)

if "%~1"=="" (
  if exist "%~dp0qwen_image_edit_api_script.js" (
    echo Running: portable node qwen_image_edit_api_script.js
    "%~dp0%PORTABLE_DIR%\node.exe" "%~dp0qwen_image_edit_api_script.js"
    exit /b %ERRORLEVEL%
  ) else (
    echo No arguments and qwen_image_edit_api_script.js not found in current folder.
    echo Usage:
    echo   run_with_portable_npm_WINDOWS.bat npm install
    echo   run_with_portable_npm_WINDOWS.bat npm run start
    echo   run_with_portable_npm_WINDOWS.bat node your_script.js
    exit /b 1
  )
) else (
  if /I "%~1"=="npm" (
    if exist "%~dp0npm.bat" (
      shift
      call "%~dp0npm.bat" %*
      exit /b %ERRORLEVEL%
    ) else (
      echo npm.bat not found. Run install_portable_npm_WINDOWS.bat first.
      exit /b 1
    )
  ) else if /I "%~1"=="node" (
    shift
    "%~dp0%PORTABLE_DIR%\node.exe" %*
    exit /b %ERRORLEVEL%
  ) else (
    "%~dp0%PORTABLE_DIR%\node.exe" %*
    exit /b %ERRORLEVEL%
  )
)

endlocal
