# Spec-style prompt template for Blender MCP

Treat the prompt like a written spec, not a vibe. Claude translates exact numbers
into geometry math, so give it the same dimensions you'd put on a drawing.

## Session preamble (paste once at the start of every modeling chat)

> You are modeling in Blender via MCP. The scene is set to **Imperial units —
> all dimensions I give are in feet and inches** (e.g. 9'-1 1/8" = 9.09375 ft =
> 2.7718 m internally). Always convert exactly; never round plate heights or
> framing dimensions. Build with the ground plane at Z=0 and the front facade
> facing -Y. Name objects descriptively (Wall_Front_FirstFloor, Roof_Main, etc.)
> and keep floors in separate collections so I can isolate them.

## Massing model example (Colonial Revival)

> Imperial units. Create a two-story massing model:
>
> - Footprint: 41'-0" wide x 39'-0" deep
> - First floor plate height: 9'-1 1/8"
> - Floor system between levels: 12"
> - Second floor plate height: 8'-1 1/8"
> - Roof: side-gable, 12:12 pitch, ridge running parallel to the front facade,
>   16" eave overhang, 12" rake overhang
> - Front facade: 5 bays, windows on 8'-0" centers, centered entry bay
> - First-floor windows: 3'-0" x 5'-6", sills at 2'-8" AFF
> - Second-floor windows: 3'-0" x 4'-6", sills at 2'-8" AFF
> - Entry: 3'-0" x 6'-8" door with a center portico, gabled, 6'-0" wide x 4'-0"
>   deep, on two columns
>
> Use simple boxes for massing — no materials yet. When done, report the overall
> ridge height above grade.

## Iterating

Short, surgical revisions work best — one change at a time:

- "Push the main roof to 10:12 and tell me the new ridge height."
- "Add a 1'-6" deep x 8" tall water table band at the first floor line."
- "Replace the portico columns with Tuscan columns at correct Vignola
  proportions for a 8'-0" shaft height — give me the diameter you derived."

You can also paste your own proportion rules (e.g. the Five Orders ratios) into
the preamble and tell Claude to derive all classical elements from them.

## Verifying dimensions

After any build step, ask:

> Select Wall_Front_FirstFloor and report its exact dimensions in feet-inches.

Claude reads the values back from Blender's API — a real measurement, not a guess.
