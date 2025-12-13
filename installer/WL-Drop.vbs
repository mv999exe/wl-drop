Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

' Get the directory where this VBS file is located
scriptDir = fso.GetParentFolderName(WScript.ScriptFullName)

' Set paths
pythonDir = scriptDir & "\python"
pythonExe = pythonDir & "\python.exe"
runScript = scriptDir & "\run.py"
uploadsDir = scriptDir & "\uploads"

' Create uploads directory if needed
If Not fso.FolderExists(uploadsDir) Then
    fso.CreateFolder(uploadsDir)
End If

' Build command to run Python directly
Dim cmd
cmd = """" & pythonExe & """ """ & runScript & """"

' Run Python completely hidden (0 = hidden window, False = don't wait)
WshShell.Run cmd, 0, False

' Wait a moment for server to start
WScript.Sleep 2000

' Open browser
WshShell.Run "http://localhost:8000", 1, False

' Exit VBScript
Set WshShell = Nothing
Set fso = Nothing
