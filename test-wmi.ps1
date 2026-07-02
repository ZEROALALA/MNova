$query = "SELECT * FROM __InstanceCreationEvent WITHIN 2 WHERE TargetInstance ISA 'Win32_PnPEntity' AND (TargetInstance.Caption LIKE '%Controller%' OR TargetInstance.Caption LIKE '%Gamepad%' OR TargetInstance.Caption LIKE '%Xbox%')"
Register-WmiEvent -Query $query -SourceIdentifier "GamepadConnected" -Action {
    Write-Host "CONNECTED"
}
Write-Host "Listening for gamepads..."
while ($true) { Start-Sleep -Seconds 1 }
