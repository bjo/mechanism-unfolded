# Driving lesson: model contract

The public order is engine (1–4), steering/suspension (5), differential (6), manual transmission (7), braking and driving (8). Experiment IDs stay unchanged. Old numbered links intentionally follow the new public order; the automatic lesson's manual-transmission link now points to chapter 7.

## Steering and differential

The existing MX-5-inspired open differential does not engage in response to a steering command. Both outputs remain driven. With equal tire radii and pure rolling, a corner imposes different wheel travel distances. The reference bicycle geometry is R = L / tan(delta), with wheelbase L=2.4 m and track t=1.5 m. Rear wheel rates relative to the carrier are 1 ± t/(2R). Locking the axle overrides these rates to 1/1; the path comparison then reports the rolling mismatch that must be accommodated by scrub. This is not a lateral tire-force model or an understeer prediction.

Source: [Eaton open differential explanation](https://www.eaton.com/gb/en-gb/products/differentials-traction-control/open-differential.html). The 3D steering rig retains its fixed rods and simplified parallel-arm topology. In the full vehicle, rack displacement is solved so the mean rendered wheel angle matches the representative road angle; this is a bicycle approximation, not exact Ackermann geometry.

## Longitudinal calculation

`car-road.js` uses SI units, 1,200 kg, 0.31 m tire radius, final drive 3, efficiency .9, rolling coefficient .012, air density 1.225 kg/m³ and CdA .65 m². These are teaching assumptions, not factory specifications. Gear ratios are shared with the rendered transmission. The engine curve is an explicitly invented smooth envelope, capped by a 6,500 rpm fuel cut. It is separate from the earlier ideal gas-cycle illustration and must not be presented as measured engine output.

F_road = m g Crr + 0.5 rho CdA v². [NASA's drag equation](https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/drag-equation/) supports the aerodynamic term. Wheel torque is transmitted engine torque × total reduction × efficiency; tractive force is wheel torque / tire radius. Acceleration is net force / mass; speed and signed position are integrated. Brakes and drag stop motion without initiating opposite motion. Required wheel torque means the magnitude needed to balance road load at the current speed; net torque includes road load and brakes. Four acceleration buttons select 25/50/75/100% throttle, not four prescribed speeds. Low throttle at high speed can decelerate the car.

When the depicted engine clutch is open no engine torque reaches the wheels. When its faces touch at launch, input/engine slip is represented by a 110 N·m transfer cap and an 800 rpm idle floor. No pedal-travel friction model, engine inertia, clutch heating, adhesion limit, grade or production ECU is modeled. Once synchronized, road speed and the selected ratio determine engine RPM. Over-rev downshifts and changes between forward/reverse while moving are rejected.

All displayed shafts use the same 1/120 angular display factor. Numerical vehicle speed is the SI calculation, not the slowly rendered wheel circumference per wall second. Gear/synchronizer actions use the same selected simulation clock in guided driving; manual user-actuated gear selection still runs while powered motion is paused. During shifts the output coasts and target input phase follows the moving output before dog engagement. Numerical and visual scale differences are disclosed in the dashboard.

## Guided drive and validation

The 39-phase guide performs 1–6 selection and four throttle stages in each, coasts while shifting, brakes before the corner, steers, stops, selects reverse, runs four reverse throttle stages and stops again. Speed conditions gate reverse and completion of braking. Three pedal bars and a live causal description accompany the 3D assembly. A car-centered road trace follows integrated position and representative steering angle; it is a kinematic path, not a full-body dynamic simulation.

`node tests/car-road.cjs ../three-0.160.1.cjs` verifies all phases, reverse-after-stop, coast during shifts, force/torque/RPM relations, rigid parts, fork contact, meshing planes, engaged dog phase, rack-to-angle consistency, output/propeller/differential continuity and pause. Three injected faults must fail. Existing gear, pedal, steering, brake and engine tests remain in the regression suite. These checks are not a universal CAD collision or real-vehicle performance certification.
