@{
    # Configuración para PSScriptAnalyzer
    # Suprime advertencias sobre verbos no aprobados en scripts de instalación
    
    # Reglas a excluir
    ExcludeRules = @(
        'PSUseApprovedVerbs'  # Permitir verbos personalizados en scripts de instalación
    )
    
    # Configuración específica para scripts de instalación
    Settings = @{
        PSUseApprovedVerbs = @{
            # Permitir verbos personalizados para scripts de instalación
            AllowCustomVerbs = $true
        }
    }
} 