Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

' Get the directory where this VBS file is located
scriptDir = fso.GetParentFolderName(WScript.ScriptFullName)

' Set Python path
pythonDir = scriptDir & "\python"
pythonwExe = pythonDir & "\pythonw.exe"
pythonExe = pythonDir & "\python.exe"
trayScript = scriptDir & "\tray_app.py"

' Check if pythonw.exe exists (for full Python) or use python.exe (for embedded)
Dim pythonCmd
If fso.FileExists(pythonwExe) Then
    pythonCmd = """" & pythonwExe & """ """ & trayScript & """"
Else
    pythonCmd = """" & pythonExe & """ """ & trayScript & """"
End If

' Run completely hidden (0 = hidden window, False = don't wait)
WshShell.Run pythonCmd, 0, False

' Exit VBScript
Set WshShell = Nothing
Set fso = Nothing
