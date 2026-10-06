@echo off
title Laundry Express - Build Standalone EXE
cd /d "%~dp0"
echo Publishing Standalone Single-File EXE (Please wait)...
"C:\Users\benjamin\dotnet-sdk\dotnet.exe" publish LaundryAdminApp.csproj -c Release -r win-x64 --self-contained true -p:PublishSingleFile=true -p:IncludeNativeLibrariesForSelfExtract=true -o "%~dp0"
echo.
echo Build Complete! LaundryAdminApp.exe is ready.
pause
