# Reglas interpretadas y puntos pendientes

Todo lo de abajo es **configurable en Ajustes > Parámetros** salvo donde se indica. Marcado con ❓ lo que conviene confirmar con el cliente.

## Lectura del reloj
- Solo se usan ID de persona, nombre y hora (se descarta el resto). El archivo se lee como ISO-8859-1.
- El reloj no distingue entrada/salida: se asigna por orden dentro del día (1.ª entrada, 2.ª salida, 3.ª entrada…).
- Las marcas se toman al minuto (se ignoran los segundos).
- Cantidad **impar** de marcas en un día laboral => alerta roja "Registro faltante". La contadora puede agregar la marca, ignorar una marca de más o dar el día por revisado (se calcula solo con los pares completos; un día con una sola marca dado por revisado cuenta como ausencia).
- Marcas seguidas (misma hora o casi): se tratan como una entrada-salida normal, sin alerta (pedido del cliente). Existe el ajuste "Ignorar marcas repetidas dentro de X min" (0 = desactivado) y, en la revisión, el botón "Ignorar marcas repetidas". ❓ En el CSV de muestra aparecen varias (por ejemplo 16:00 dos veces): con 4 marcas generan una "salida intermedia" de 0 hs.
- 4 marcas = 1 salida intermedia.
- Marcas en sábado, domingo o días no laborales marcados: no se computan (aviso amarillo).
- Un ID del CSV que no existe en Empleados frena el proceso hasta darlo de alta (alta rápida, DNI opcional).

## Horas (planilla)
- Jornada 7:00–16:00 = 9 hs, sin descontar almuerzo. ❓ Media jornada: se ignora por ahora.
- Se cuentan solo las horas dentro de 7:00–16:00. Llegar hasta 15 min tarde (tolerancia) no descuenta horas; pasada la tolerancia se descuenta el tiempo real.
- Horas extra = tiempo fuera de 7:00–16:00, redondeado a 0,5 hs. Se muestran en la tarjeta, pero **no suman** a la planilla (no hay columna). Hay un ajuste para sumarlas a "Hs". ❓
- Hs = horas trabajadas, redondeadas a 0,5 hs por mes.
- Comp = horas por sábado (3) × sábados del mes. Hs.Fer. = días laborables marcados como no laborales × 9.
- Enf / ART / Lic / Otro = horas cargadas a mano en las justificaciones (se asignan al mes de la fecha de inicio). Se agregaron las columnas Lic y Otro a la planilla. Total = Hs + Comp + Hs.Fer. + Enf + ART + Lic + Otro.
- Una justificación sobre un día evita que ese día cuente como ausencia, llegada tarde o salida intermedia.
- ❓ Una salida definitiva antes de las 16:00 (sin volver) descuenta horas pero hoy **no** cuenta como incidente de presentismo. Falta definirlo (se vincula con la media jornada).

## Grados de presentismo (se recalculan cada mes)
| Grado | Salidas interm. | Horas de salidas | Llegadas tarde | Ausencias media jornada | Ausencias jornada completa |
|---|---|---|---|---|---|
| Medio presentismo | ≤ 2 | ≤ 6 | ≤ 2 | ≤ 2 | ≤ 1 ❓ |
| Presentismo | ≤ 1 | ≤ 4 | ≤ 1 | ≤ 1 | 0 ❓ |
| Puntualidad | igual que presentismo + ninguna llegada después de las 7:00 | | | | |

- Los topes se aplican **a la vez y por categoría**. Bonos provisorios: 137.000 / 70.000 / 56.000.
- ❓ En el CSV de muestra hay empleados con una ausencia completa que en la planilla de ejemplo cobran $0 (por ejemplo 202 o 228). Con la regla actual (medio presentismo admite 1 ausencia) cobrarían medio presentismo. Conviene confirmarlo.
- Alerta amarilla "Verificar [grado]": si perdonando **un solo** incidente menor (llegada hasta 15 + 10 min tarde, o salida de hasta 10 min) subiría de grado. Desde la alerta se puede cargar la justificación y recalcular.

## Resumen mensual / historial
- Al finalizar se guarda una copia del resumen (planilla + detalle por empleado) de ese mes; el Historial muestra ese resumen tal como se imprimió, aunque después cambien los ajustes.
- Reprocesar un mes reemplaza el anterior.
- Empleados que están en la planilla en papel pero no en el reloj (dueños/supervisores): no se incluyen.

## Seguridad
- Cada operación valida el rol en el servidor (el subadministrador solo accede a Justificaciones, Historial y Apariencia).
- Contraseñas con scrypt. El PIN se guarda sin cifrar (a pedido); los cambios de parámetros, limpiar registros y cambiar el PIN lo exigen.
- La conexión entre PCs es HTTP sin cifrar, solo para la red local.
