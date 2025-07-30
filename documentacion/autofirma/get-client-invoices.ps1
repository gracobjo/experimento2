$login = Invoke-RestMethod -Uri 'http://localhost:3000/api/auth/login' -Method POST -ContentType 'application/json' -Body '{"email":"cliente1@test.com","password":"password123"}'
$headers = @{ 'Authorization' = 'Bearer ' + $login.token }
Invoke-RestMethod -Uri 'http://localhost:3000/api/invoices/my' -Headers $headers | ConvertTo-Json -Depth 3 