Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

' Get the directory where this VBS file is located
scriptDir = fso.GetParentFolderName(WScript.ScriptFullName)

' Run the batch file completely hidden (0 = hidden window)
WshShell.Run """" & scriptDir & "\WL-Drop-Silent.bat""", 0, False

' Exit VBScript
Set WshShell = Nothing
Set fso = Nothing
