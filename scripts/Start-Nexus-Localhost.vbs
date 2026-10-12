Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = "E:\500+_AI_Agent\multi-vendor-ecommerce"
WshShell.Run "cmd /c scripts\start-nexus-background.bat", 0, False
