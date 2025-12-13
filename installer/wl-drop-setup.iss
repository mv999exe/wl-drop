; WL-Drop Setup Script for Inno Setup
; Creates a professional Windows installer

#define MyAppName "WL-Drop"
#define MyAppVersion "1.1.0"
#define MyAppPublisher "mv999exe"
#define MyAppURL "https://github.com/mv999exe/wl-drop"
#define MyAppExeName "WL-Drop.exe"

[Setup]
; App Information
AppId={{A5B6C7D8-E9F0-4A5B-9C8D-7E6F5A4B3C2D}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}/issues
AppUpdatesURL={#MyAppURL}/releases
DefaultDirName={autopf}\{#MyAppName}
DefaultGroupName={#MyAppName}
AllowNoIcons=yes
; LicenseFile=..\LICENSE
OutputDir=..\release
OutputBaseFilename=wl-drop-v{#MyAppVersion}-windows-setup
; SetupIconFile=..\assets\logo.ico
Compression=lzma2/max
SolidCompression=yes
WizardStyle=modern
PrivilegesRequired=admin
ArchitecturesAllowed=x64
ArchitecturesInstallIn64BitMode=x64

; Uninstall
UninstallDisplayIcon={app}\{#MyAppExeName}
UninstallFilesDir={app}\uninstall

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"
Name: "arabic"; MessagesFile: "compiler:Languages\Arabic.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"
Name: "quicklaunchicon"; Description: "{cm:CreateQuickLaunchIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked

[Files]
; Embedded Python Runtime (will be downloaded)
Source: "..\build\python-embed\*"; DestDir: "{app}\python"; Flags: ignoreversion recursesubdirs createallsubdirs
; Application Files
Source: "..\dist\*"; DestDir: "{app}\dist"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "..\backend\*"; DestDir: "{app}\backend"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "..\run.py"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\requirements.txt"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\README.md"; DestDir: "{app}"; Flags: ignoreversion isreadme
Source: "..\LICENSE"; DestDir: "{app}"; Flags: ignoreversion
; Launcher Script
Source: "..\installer\WL-Drop-Launcher.bat"; DestDir: "{app}"; Flags: ignoreversion

[Icons]
Name: "{group}\{#MyAppName}"; Filename: "{app}\WL-Drop-Launcher.bat"
Name: "{group}\{cm:UninstallProgram,{#MyAppName}}"; Filename: "{uninstallexe}"
Name: "{autodesktop}\{#MyAppName}"; Filename: "{app}\WL-Drop-Launcher.bat"; Tasks: desktopicon
Name: "{userappdata}\Microsoft\Internet Explorer\Quick Launch\{#MyAppName}"; Filename: "{app}\WL-Drop-Launcher.bat"; Tasks: quicklaunchicon

[Run]
; Install Python dependencies after installation
Filename: "{app}\python\python.exe"; Parameters: "-m pip install --no-warn-script-location -r ""{app}\requirements.txt"""; StatusMsg: "Installing Python dependencies..."; Flags: runhidden
; Offer to launch after installation
Filename: "{app}\WL-Drop-Launcher.bat"; Description: "{cm:LaunchProgram,{#StringChange(MyAppName, '&', '&&')}}"; Flags: nowait postinstall skipifsilent

[Code]
var
  DownloadPage: TDownloadWizardPage;

function OnDownloadProgress(const Url, FileName: String; const Progress, ProgressMax: Int64): Boolean;
begin
  if Progress = ProgressMax then
    Log(Format('Successfully downloaded %s to %s', [Url, FileName]));
  Result := True;
end;

procedure InitializeWizard;
begin
  DownloadPage := CreateDownloadPage(SetupMessage(msgWizardPreparing), SetupMessage(msgPreparingDesc), @OnDownloadProgress);
end;

function NextButtonClick(CurPageID: Integer): Boolean;
begin
  if CurPageID = wpReady then begin
    DownloadPage.Clear;
    // Download Python Embedded (Small, portable Python)
    DownloadPage.Add('https://www.python.org/ftp/python/3.11.9/python-3.11.9-embed-amd64.zip', 'python-embed.zip', '');
    DownloadPage.Show;
    try
      try
        DownloadPage.Download;
        Result := True;
      except
        if DownloadPage.AbortedByUser then
          Log('Aborted by user.')
        else
          SuppressibleMsgBox(AddPeriod(GetExceptionMessage), mbCriticalError, MB_OK, IDOK);
        Result := False;
      end;
    finally
      DownloadPage.Hide;
    end;
  end else
    Result := True;
end;

procedure CurStepChanged(CurStep: TSetupStep);
var
  ResultCode: Integer;
  PythonZip, ExtractPath: String;
begin
  if CurStep = ssPostInstall then begin
    // Extract Python Embedded
    PythonZip := ExpandConstant('{tmp}\python-embed.zip');
    ExtractPath := ExpandConstant('{app}\python');
    
    if FileExists(PythonZip) then begin
      Log('Extracting Python to: ' + ExtractPath);
      Exec(ExpandConstant('{sys}\WindowsPowerShell\v1.0\powershell.exe'), 
        '-Command "Expand-Archive -Path ''' + PythonZip + ''' -DestinationPath ''' + ExtractPath + ''' -Force"',
        '', SW_HIDE, ewWaitUntilTerminated, ResultCode);
    end;
    
    // Create uploads directory
    CreateDir(ExpandConstant('{app}\uploads'));
  end;
end;
