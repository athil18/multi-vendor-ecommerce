' Nexus Autonomous Commerce Grid - Silent Background Startup Wrapper
' Governed by: engineering-devops-automator & engineering-infrastructure-maintainer
' 
' Executes dev-supervisor.js in background with zero visible console window.

Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

' Resolve path to dev-supervisor.js in current directory
scriptDir = fso.GetParentFolderName(WScript.ScriptFullName)
supervisorPath = fso.BuildPath(scriptDir, "dev-supervisor.js")

' Launch node dev-supervisor.js daemon silently (0 = hide window, false = do not wait)
command = "node """ & supervisorPath & """ daemon"
WshShell.Run command, 0, False

Set WshShell = Nothing
Set fso = Nothing
