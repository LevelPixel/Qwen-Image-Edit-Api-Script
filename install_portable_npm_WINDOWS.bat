@echo off
rem -----------------------------
rem install_portable_npm_WINDOWS.bat
rem -----------------------------
setlocal
set NODE_VERSION=20.8.0
set PORTABLE_DIR=portable_node
set ZIP_NAME=node.zip

echo.
echo === Preparing portable Node/npm (version %NODE_VERSION%) ===

set DOWNLOAD_URL=https://nodejs.org/dist/v%NODE_VERSION%/node-v%NODE_VERSION%-win-x64.zip

echo Downloading: %DOWNLOAD_URL%
if exist "%ZIP_NAME%" del /f /q "%ZIP_NAME%"

powershell -Command "try { Invoke-WebRequest -Uri '%DOWNLOAD_URL%' -OutFile '%ZIP_NAME%' -UseBasicParsing -ErrorAction Stop } catch { exit 1 }"
if errorlevel 1 (
  echo Error: failed to download %DOWNLOAD_URL%.
  echo Check NODE_VERSION or your internet connection.
  exit /b 1
)

echo Extracting %ZIP_NAME% ...
powershell -Command "try { Expand-Archive -Path '%ZIP_NAME%' -DestinationPath . -Force } catch { exit 1 }"
if errorlevel 1 (
  echo Error: failed to extract archive.
  exit /b 1
)

if exist "%PORTABLE_DIR%" (
  echo Removing old folder %PORTABLE_DIR% ...
  rd /s /q "%PORTABLE_DIR%"
)

set EXTRACTED_DIR=node-v%NODE_VERSION%-win-x64
if not exist "%EXTRACTED_DIR%" (
  echo Extracted folder "%EXTRACTED_DIR%" not found. Current folder listing:
  dir
  exit /b 1
)

move "%EXTRACTED_DIR%" "%PORTABLE_DIR%" >nul
if errorlevel 1 (
  echo Error: failed to rename extracted folder to %PORTABLE_DIR%.
  exit /b 1
)

echo Creating npm.bat wrapper ...
(
  echo @echo off
  echo set SCRIPT_DIR=%%~dp0
  echo "%%SCRIPT_DIR%%%PORTABLE_DIR%\node.exe" "%%SCRIPT_DIR%%%PORTABLE_DIR%\node_modules\npm\bin\npm-cli.js" %%*
) > npm.bat

echo npm.bat created.

echo Installing dependencies: axios, mime-types, dotenv

"%CD%\%PORTABLE_DIR%\node.exe" "%CD%\%PORTABLE_DIR%\node_modules\npm\bin\npm-cli.js" install axios mime-types dotenv --no-audit --no-fund
if errorlevel 1 (
  echo Error: failed to install dependencies using local npm.
  echo Inspect %PORTABLE_DIR%\node_modules\npm for diagnostics.
  exit /b 1
)

if exist "%ZIP_NAME%" del /f /q "%ZIP_NAME%"

echo.
echo === Done. Portable Node/npm deployed to .\%PORTABLE_DIR% ===
echo npm.bat was created in current folder — use it to run npm (or use run_with_portable_npm.bat)
endlocal
