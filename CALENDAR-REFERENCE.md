# Day/date lesson construction contract

Primary reference: [Seiko 6139A service guide](https://seikoserviceusa.com/uploads/datasheets/6139A.pdf), printed page 3, “Calendar Mechanism”.

The guide identifies the day star with dial disk (22), date dial (25), date jumper (26), day/date corrector (27), day finger (31), date finger (32), hour wheel (33), intermediate date wheel (34), date driving wheel (35), and cannon pinion (36). Separate fingers drive separate displays. The day disk and its star are coaxial. The date annulus surrounds them.

This calendar is an extension of the site's existing generic teaching movement, **not a 6139A calendar reconstruction**. It uses a single-language seven-position weekday output. The actual guide describes a bilingual disk and crown depression: intermediate depth corrects the date; further depression corrects the day. Those quickset parts are not represented by the existing rotary crown correction train. The UI explicitly states this distinction; the weekday selector initializes the demonstration and does not pretend to actuate a real corrector.

## Modeled connections

- Existing hour wheel → 24-hour wheel; two fingers are rigidly attached to that daily arbor.
- Lower red finger → 31-position outer date ring and its jumper.
- Upper purple finger → central seven-position star → hollow arbor → weekday display.
- Independent pivoted weekday detent follows the star boundary. Its nose radius and fixed arm length determine the pose; the green arc identifies its spring. Spring forces and spring-end deformation are omitted.
- Display plate is skeletonized; spokes and arbor remain visible. No dynamic stretching or explosion separates the layers.
- A forward midnight increments each output once. Rotary date quickset changes only date. Initialization selectors are labeled as such.

## Inferred educational dimensions

All dimensions, tooth profiles, jumper outline, phase, and single-language indexing geometry are chosen for this explanatory model, not measured from the service guide. Weekday drive plane is z=.29, display plane z=.49; date drive plane is approximately z=.17. The purple finger has .95 reach and .83 visible length. The follower arm is .52 long. The central hollow arbor leaves the hand shafts free. The daily drive projects toward the central star; the date finger projects toward the outer annulus.

## Validation scope

Pure regressions check seven-day and 31-day boundaries, independent quickset, continuous contact-angle transfer, fixed finger/lever lengths, follower contact, and axial separation. The browser exposes actual world-transformed landmarks through `data-weekday-contact`, while the existing copy audit compares installed and inspection transforms. These checks do not certify manufacturing tooth profiles, torque, backlash, or all-body collision clearance.
