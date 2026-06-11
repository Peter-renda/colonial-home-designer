"""Configure Blender for imperial-unit architectural modeling.

Run once from Blender's Scripting workspace (open this file, press Run Script),
then File > Defaults > Save Startup File so every new file starts this way.

Sets:
  - Imperial units, lengths displayed in feet (fractional inches in dimensions)
  - Viewport grid aligned to 1-foot increments
  - Viewport clip range wide enough for a full house + site (3 in .. ~3300 ft)
"""

import bpy

FOOT = 0.3048  # meters

scene = bpy.context.scene
units = scene.unit_settings
units.system = 'IMPERIAL'
units.length_unit = 'FEET'
units.system_rotation = 'DEGREES'
units.scale_length = 1.0  # keep internal meters; display converts to ft/in

for screen in bpy.data.screens:
    for area in screen.areas:
        if area.type != 'VIEW_3D':
            continue
        for space in area.spaces:
            if space.type != 'VIEW_3D':
                continue
            space.clip_start = 0.0762        # 3 inches
            space.clip_end = 1000.0          # ~3280 ft
            space.overlay.grid_scale = FOOT  # grid lines on foot boundaries

print("Imperial units set: lengths in feet, grid on 1-ft increments.")
print("Now do File > Defaults > Save Startup File to make this the default.")
