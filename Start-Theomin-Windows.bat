@echo off
if "%~1"=="hidden" goto :run

:: Roda este próprio arquivo de forma invisível via VBScript
echo Set objShell = WScript.CreateObject("WScript.Shell") > "%temp%\run_hidden.vbs"
echo objShell.Run "cmd /c """ ^& WScript.Arguments(0) ^& """ hidden", 0, False >> "%temp%\run_hidden.vbs"
cscript //nologo "%temp%\run_hidden.vbs" "%~f0"
del "%temp%\run_hidden.vbs"
exit

:run
:: Arquivo de inicialização do Theomin para Windows
:: Este script pode ter um atalho criado na sua Área de Trabalho para facilitar o acesso.

cd /d "%~dp0"
echo ==============================================
echo Iniciando o servidor do Theomin...
echo ==============================================

:: Verifica se é a primeira vez rodando (se as dependências estão instaladas)
if not exist "node_modules\" (
    echo ==============================================
    echo Primeira execucao detectada!
    echo Instalando as dependencias necessarias...
    echo Isso pode levar alguns minutos.
    echo ==============================================
    call npm install
    echo.
)

:: Garante que não há processos zumbis segurando a porta do Theomin
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5173" ^| find "LISTENING"') do taskkill /f /pid %%a >nul 2>&1

:: Define o navegador a ser usado no modo App
set BROWSER_CMD=start http://localhost:5173
reg query "HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\chrome.exe" >nul 2>&1
if %errorlevel% equ 0 set BROWSER_CMD=start chrome --app=http://localhost:5173
reg query "HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\msedge.exe" >nul 2>&1
if %errorlevel% equ 0 set BROWSER_CMD=start msedge --app=http://localhost:5173

:: Inicia o navegador aguardando o servidor ligar
start "" /B cmd /c "for /l %%x in (1, 1, 30) do (curl -s http://localhost:5173 >nul && (%BROWSER_CMD% & exit) || timeout /t 1 >nul)"

:: Inicia o servidor Vite
call npm run dev

