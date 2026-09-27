Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = "C:\Users\Rakshith D\Desktop\36\backend"
WshShell.Run "cmd /c node dist\index.js", 0, False
