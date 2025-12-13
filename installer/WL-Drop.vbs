Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

' Get the directory where this VBS file is located
scriptDir = fso.GetParentFolderName(WScript.ScriptFullName)

' Set paths
pythonDir = scriptDir & "\python"
pythonExe = pythonDir & "\python.exe"
trayScript = scriptDir & "\tray_app.py"

' Run tray app completely hidden (0 = hidden window, False = don't wait)
Dim cmd
cmd = """" & pythonExe & """ """ & trayScript & """"
WshShell.Run cmd, 0, False

' Exit VBScript
Set WshShell = Nothing
Set fso = Nothing
