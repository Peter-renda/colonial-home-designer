/**
 * Short educational blurbs shown behind the "i" icon next to each quiz
 * question. Written for a first-time custom-home buyer: what the item is,
 * why it matters, and what drives cost — in two or three sentences.
 */

// ── shared blurbs for repeated question patterns ────────────────
const SINK_FAUCET =
  "The faucet finish and brand set the tone for the room and vary widely in price ($100–$1,000+). Solid-brass bodies and ceramic cartridges last decades; describe a style (bridge, widespread, single-hole) and finish (brass, bronze, chrome, nickel).";
const SHOWER_FAUCET =
  "Shower valves hide inside the wall, so quality matters — they're expensive to replace later. Pressure-balanced valves are standard; thermostatic valves hold an exact temperature and cost more.";
const TUB_SHOWER =
  "Tub/shower combos are practical for kids and resale; walk-in tile showers feel more luxurious. Tile showers need waterproofing and glass, adding $3K–$10K+ over a one-piece unit.";
const BATH_MIRROR =
  "Framed mirrors elevate a bath for little money. Consider a mirror sized to the vanity, or a recessed medicine cabinet for storage in tighter baths.";
const BATH_HARDWARE =
  "Towel bars, hooks, paper holders, and robe hooks. Matching them to the faucet finish makes the room feel designed rather than assembled.";
const BATH_CABINET =
  "Vanity cabinets take more moisture abuse than kitchen cabinets — plywood boxes and quality drawer slides hold up best. Furniture-style vanities with legs read more 'colonial' than builder boxes.";
const COUNTER_MATERIAL =
  "Marble is classic for colonial homes but etches with acids; quartzite (like Taj Mahal) gives a similar look with more durability. Soapstone is non-porous and darkens gracefully with age.";
const COUNTER_EDGE =
  "The edge profile is cut into the countertop slab. Eased (slightly softened square) is modern-classic and cheapest; ogee's S-curve is the most traditional and formal; bullnose is fully rounded and kid-friendly.";
const TRIM_BY_ROOM =
  "Pick which trim layers this room gets. Baseboard is standard everywhere; crown dresses the ceiling line; chair rail protects walls at ~32–36 inches; wainscoting (paneling below the chair rail) is the most formal and most costly.";
const OVER_MIRROR_LIGHT =
  "Sconces or a bar light at face height (about 65–70 inches) light your face evenly for grooming — far better than a ceiling fixture alone. Plan one fixture per sink or a sconce pair flanking the mirror.";
const CEILING_LIGHT =
  "General overhead light for the room. A small flush-mount or semi-flush adds character; pair it with mirror lighting so the bath has no shadows.";
const EXTERIOR_LIGHT =
  "Exterior fixtures should be scaled larger than you think — roughly 1/4 to 1/3 the height of the door they flank. Lantern-style fixtures in black or aged brass suit colonial architecture.";
const SURROUND_SOUND =
  "Pre-wiring during framing costs a fraction of retrofitting after drywall. Describe the zones and speaker count you want; in-ceiling speakers stay invisible.";
const FLOOR_CHOICE =
  "Site-finished solid oak is the traditional choice and can be refinished for a century. Engineered oak is more stable over slabs and in humidity; LVP is the budget- and water-proof option but won't refinish.";
const BATH_FLOOR =
  "Baths need water-tolerant flooring. Mosaics (hex, basketweave, checkerboard marble) are period-correct for colonial homes and add slip resistance from their many grout lines.";
const STAIR_FLOOR =
  "Stair treads take the most wear in the house. Solid oak treads with a painted riser is the classic colonial look; a runner adds quiet and grip — good with kids and pets.";
const CASING_UPGRADE =
  "Crossetted ('eared') casings step outward at the top corners — a hallmark of formal Georgian and Federal rooms. Adding a header builds the casing up with a decorative cap for even more presence.";

export const QUESTION_INFO: Record<string, string> = {
  // ── site analysis ─────────────────────────────────────────────
  topoMap:
    "A topographic (contour) map or boundary survey shows your lot's shape, elevations, and slopes. We use it to orient the house, set the foundation type, and plan drainage. A surveyor or your county GIS site can provide one.",
  lotSize:
    "Lot size drives setbacks, septic field placement, driveway length, and landscaping budget. Larger lots give siting flexibility but cost more to clear, grade, and maintain.",
  streetFacing:
    "Orientation controls natural light. A south-facing front gets all-day sun on the facade; a north-facing front means the rear porch and kitchen get the southern sun. East = morning light in front rooms; west = strong afternoon sun (plan shading).",
  lotSlope:
    "Slope is the single biggest site cost factor. Flat lots suit slab foundations; moderate slopes often favor crawlspaces or walkout basements; steep lots need engineered foundations, retaining walls, and more excavation.",
  slopeDirection:
    "Which way the land falls decides where water goes and where a walkout basement could daylight. Sloping toward the street helps drainage but can make the driveway steep; sloping to the rear suits a walkout basement.",
  soilType:
    "Soil determines how the foundation is engineered. Sandy soils drain well; expansive clay swells and shrinks (needs deeper or reinforced footings); rock near the surface makes basements expensive; fill soil must be compacted or excavated. A geotechnical (soils) test removes the guesswork.",
  drainage:
    "Where water sits, foundations suffer. Poor drainage or a high water table argues against a basement and calls for perimeter drains, swales, and gutters that discharge well away from the house.",
  floodZone:
    "FEMA flood zones (A/AE) require flood insurance with a mortgage and may dictate a raised foundation with flood vents. Check the FEMA flood map for your parcel — it affects cost, design, and insurance for the life of the home.",
  treeCoverage:
    "Clearing and stump removal can run thousands per acre. Mature trees you keep add value and shade — flag the ones worth saving early so excavation doesn't damage their root zones.",
  utilities:
    "Available utilities shape both budget and design. A well and septic system can add $15K–$40K+ and a septic field needs a perc test to locate. Natural gas affects your heating, cooktop, and water-heater choices.",
  setbacks:
    "Setbacks are the minimum distances the house must keep from property lines, set by zoning. They define the buildable envelope — find them on your plat, zoning code, or from the county planning office.",
  siteRestrictions:
    "HOA covenants and zoning can limit height, square footage, exterior materials, fences, and detached buildings. Reading them before design avoids expensive redraws.",

  // ── foundation ────────────────────────────────────────────────
  foundationType:
    "Slab on grade: concrete poured at ground level — most economical, best on flat lots, but plumbing is locked in the slab. Crawlspace: the house sits on stem walls 2–3' above grade — access to plumbing and ducts, suits gentle slopes. Basement: full-depth walls add living/storage space — highest cost, best on sloped lots and where frost depth is deep anyway.",
  slabDepth:
    "Slab thickness. 4 inches is standard for living space; 6 inches adds strength for garage slabs and heavy loads (or questionable soils) at modest extra cost.",
  stoneBase:
    "A compacted crushed-stone layer under the slab creates a capillary break (keeps ground moisture from wicking up) and a stable, level base. Thicker stone helps on damp or slow-draining sites.",
  foundationSideInsulation:
    "Rigid foam on the foundation's vertical edge stops the slab/stem wall from bleeding heat to the outside air — slab edges are a major heat-loss path. Strongly recommended in cold climates for comfort and energy codes.",
  foundationBottomInsulation:
    "A continuous R-5 foam layer under the slab keeps the floor warmer underfoot and prevents condensation. It matters most with in-floor heat or finished rooms on the slab.",
  crawlspaceHeight:
    "Interior clearance between the ground and the floor framing. 2' meets minimums; 3' costs a few more block courses but makes plumbing, duct, and wiring work far easier for the life of the house.",

  // ── framing ───────────────────────────────────────────────────
  firstFloorCeilingHeight:
    "Ceiling height sets the room's sense of scale. 9' is today's sweet spot for main floors; 10' feels grand but adds material, heating volume, and taller stairs. Studs, drywall, trim, and windows all scale with it.",
  secondFloorCeilingHeight:
    "Bedrooms feel comfortable at 8'–9'. Many builders step the second floor down one foot from the first — it saves cost where the extra height is least noticed.",
  sheathing:
    "Sheathing is the structural skin over the studs. Standard OSB needs housewrap over it; the Zip System has a built-in weather barrier with taped seams — tighter air sealing and faster dry-in for a modest upcharge.",
  exteriorWall:
    "2x4 walls (3.5\" cavity) are standard; 2x6 walls (5.5\" cavity) hold roughly 40% more insulation and allow plumbing in exterior walls — a small framing upcharge that pays back in energy bills. Window jambs get deeper, which adds a handsome sill.",
  floorSystem:
    "Engineered floor trusses have open webs — ducts, plumbing, and wiring run through them, keeping ceilings flat and basements clean. I-joists are economical and very straight but mechanicals must be drilled or boxed below.",

  // ── insulation ────────────────────────────────────────────────
  exteriorInsulation:
    "A layer of rigid foam outside the sheathing wraps the studs in a thermal blanket, eliminating 'thermal bridging' (heat escaping through each stud). The single biggest comfort upgrade for walls.",
  interiorWallInsulation:
    "The R-value of insulation in the wall cavity — higher numbers resist heat flow better. R-13 fits a 2x4 wall; R-21 needs the 2x6 wall. Match this choice to your wall framing.",
  atticInsulation:
    "Heat escapes up, so attics carry the highest R-values in the house. R-38 is a common code minimum, R-49–R-60 is recommended in cold climates — blown insulation up there is cheap per R, so it's the best-value energy spend in the house.",

  // ── facade ────────────────────────────────────────────────────
  facade:
    "Brick is the iconic colonial skin — fireproof, zero-paint, lasts a century, highest upfront cost. Hardiplank (fiber cement) gives crisp painted lap siding with 50-year durability; beaded adds a shadow line. Cedar is the authentic wood original but needs repainting every 5–8 years.",
  exteriorPaint:
    "Painted brick (or limewash, which soaks in and weathers softly) is a classic look in historic districts. Note: once brick is painted it must be maintained as paint — limewash can be left to age naturally.",
  fasciaMoulding:
    "The decorated band where wall meets roof (the cornice). Georgian uses bold dentil blocks; Federal is lighter and more delicate; Greek Revival has a deep, plain frieze. This single detail does the most to set the home's historical character.",

  // ── roof ──────────────────────────────────────────────────────
  roofShape:
    "Gable (a simple A-frame ridge) is the classic colonial silhouette and the most economical. Hip roofs slope on all four sides — better in high wind, but they shrink attic space. A front gable over the entry adds Georgian formality.",
  dormers:
    "Dormers are windowed projections from the roof that bring light and headroom to the attic level — essential if you ever finish the third floor. Gable dormers are the colonial standard; eyebrow and through-the-cornice dormers are high-style details.",
  gutters:
    "5\" aluminum handles most roofs; 6\" copper is a lifetime material that ages to a brown-green patina and suits high-end colonials. Undersized gutters overflow into flowerbeds and stain the facade.",
  shingleStyle:
    "Composite slate and cedar-shake (Brava) mimic historic roofs with 50-year lifespans and far less weight and cost than real slate. GAF architectural asphalt is the value pick at 25–30 years.",
  snowguards:
    "Small brackets that hold snow on the roof so it melts gradually instead of avalanching onto porches, gutters, and shrubs. Worth it on smooth roofs (slate/composite) in snow country.",
  rafterTails:
    "Exposed rafter ends under the eaves give a hand-built, early-American character. Skipping them gives a cleaner boxed cornice — more typical of formal Georgian and Federal styles.",

  // ── windows ───────────────────────────────────────────────────
  windowStyle:
    "Single-hung (bottom sash slides) with divided-light grids is the period-correct colonial window. The grid pattern (6-over-6, 9-over-9) is what reads as 'colonial' from the street.",
  windowLevel:
    "Vinyl is economical but limits color and slim profiles. Aluminum-clad wood gives a low-maintenance exterior with a real wood interior to paint or stain — the sweet spot for traditional homes.",
  shutters:
    "Historically functional, shutters should look like they could close: sized to half the window width and mounted with hinges. Louvered is the most common colonial style; raised panel reads more formal and Georgian.",
  shutterHoldbacks:
    "The small cast-iron 'S' or scroll dogs that pin shutters open against the wall. A $20 detail per window that makes shutters look real instead of glued-on.",
  windowSillsFirstFloor:
    "The ledge at the window bottom that sheds water. Stone and brick rowlock sills are the durable masonry choices on a brick facade; wood suits sided walls. First-floor sills are at eye level — they're worth the upgrade.",
  windowSillsSecondFloor:
    "Same role as the first-floor sills, viewed from farther away. Many buyers economize here and spend on the first floor where details are seen up close.",
  windowHeadersFirstFloor:
    "The treatment above each window. Brick options (flat/straight, segmental arch, flared 'jack arch') are structural-looking masonry details; crossheads and pediments are painted millwork that dress the opening — sunburst pediments are a Federal signature.",
  windowHeadersSecondFloor:
    "Upper-floor headers usually simplify (straight brick or simple crosshead) while the first floor carries the ornament. Keeping both floors consistent reads calm; contrasting reads stately.",
  windowCasing:
    "Exterior trim boards framing each window. Builder grade is a flat 1x4; luxury casing adds backband profiles and depth. On sided houses casing is highly visible — on brick, the masonry usually does the framing.",

  // ── exterior doors ────────────────────────────────────────────
  frontDoorLevel:
    "The six-panel door is the colonial classic. Fiberglass resists weather and dents at the lowest price; solid wood has the authentic heft and detail but wants a protected entry or regular finish care; custom wood gets you exact panel proportions and species.",
  sidelights:
    "Narrow vertical windows flanking the front door — they pour daylight into the foyer and signal a formal Georgian/Federal entrance. Choose tempered or restoration glass.",
  transom:
    "The window above the front door. A fanlight (semi-elliptical with radiating muntins) is the most celebrated Federal detail in American architecture; rectangular transoms suit Greek Revival and simpler facades.",
  backDoorLevel:
    "Workhorse door — prioritize weather sealing and security over ornament. Fiberglass with a simple half-glass lite is the practical pick.",
  patioDoor:
    "French or sliding doors connecting the living space to the rear porch. Levels step up in hardware, glass, and frame quality; brass-finish hardware warms a traditional interior, bronze reads quieter.",
  sideEntranceDoor:
    "The family's daily entrance, usually into the mudroom. Spend on weatherstripping and a closer; style can stay simple since it's rarely seen from the street.",

  // ── porches & awnings ─────────────────────────────────────────
  frontPorch:
    "The landing at the front door. An 8'x6' stoop frames the entry; the 38'x10' full-width porch changes how the house lives (and adds roof, columns, and footings). Brick herringbone paving dresses up the approach.",
  portico:
    "The columned roof over the front door — the centerpiece of a colonial facade. Gable (triangular pediment) is Greek Revival/Georgian; rounded is a Federal showpiece; flat with a railing can double as a balcony. Sized to your porch choice.",
  rearPorchSlabBasement:
    "On a slab or basement foundation the rear porch pours at grade — concrete is the value pick, stamped concrete fakes stone affordably, brick is the premium, period-correct surface.",
  rearPorchStemwall:
    "With a crawlspace the porch rides on its own stem walls to meet the raised floor level, which adds masonry cost. The surface options are the same; the structure underneath differs.",
  awning:
    "The roof over the rear porch. A gable lets you vault the porch ceiling and feels taller; a hip sheds water on all sides and blends quietly into the main roof.",
  rearDoorAwningSlabBasement:
    "A small protective roof over the rear door keeps rain off you and the door. A Juliet (arched metal) awning is a jewelry detail; a shed roof on brackets is the simple traditional answer.",
  rearDoorAwningCorbelStyle:
    "The decorative brackets carrying the awning. Standard scroll is the safe classic; Cumberland is a beefier, more architectural profile.",
  rearDoorAwningStemwall:
    "Same options as on slab — on a stemwall foundation the awning mounts higher to clear the raised door and steps.",
  sideDoorAwningSlabBasement:
    "Shelter for the daily-use side entrance, where you'll actually stand fumbling for keys in the rain. A shed roof on brackets is most common.",
  sideDoorAwningStemwall:
    "Same protection on a crawlspace foundation — mounted to clear the higher door and landing.",

  // ── garage ────────────────────────────────────────────────────
  garage:
    "Side-load garages preserve the colonial facade (no doors facing the street) but need ~24' of extra driveway apron to turn into. Front-load is cheapest and fits narrow lots. Detached with a breezeway is the most historically correct — garages didn't exist in 1750.",
  garageDoorLevel:
    "The garage door is huge — it can be 30% of what you see from the street on a front-load plan. Carriage-style wood (or custom wood) doors hide the modernity; aluminum is the budget answer, best on side-load plans where it's out of view.",
  sideEntrance:
    "A person-door into the garage saves opening the big door for bikes, mowers, and trash runs. Cheap to add now, annoying to live without.",

  // ── chimney / fireplace ───────────────────────────────────────
  chimneyFireplace:
    "A masonry chimney anchors the colonial silhouette — historically homes were built around them. Adds real cost (footing, masonry, flue) but also a focal hearth and resale appeal.",
  fireplaceSurround:
    "What frames the firebox. Wood mantels with classical pilasters are the colonial standard (check clearance codes); marble is the Federal luxury; cast stone gives carved-stone looks at half the price; full brick is early-American hearth style.",

  // ── hardscaping ───────────────────────────────────────────────
  grass:
    "Sod is an instant lawn you can use in weeks; hydroseed costs a fraction but takes a season of watering and patience, and works best planted in fall or spring.",
  mailbox:
    "The first thing guests pass. A brick pier mailbox matches a brick facade and survives snowplows; a wood/vinyl post is the economical classic (check USPS height/setback rules).",
  walkwayFromCurb:
    "A straight front walk is formal and colonial-correct. Brick in herringbone or running bond beats plain concrete for curb appeal; herringbone interlocks tightest and cracks least.",
  driveway:
    "Front-load is the shortest and cheapest run. Side-load keeps cars off the facade view. A ribbon driveway (two paved strips with grass between) is a charming period detail that also reduces impervious surface.",
  horseshoeDriveway:
    "A circular drive that lets guests pull through without backing out — gracious and practical on busier roads, but it consumes front yard and needs lot width.",
  frontFlowerbedEdging:
    "Brick edging keeps mulch in and grass out, and ties beds to a brick facade. A 1'-tall brick curb is a more formal raised border; brick-on-edge is flush and mower-friendly.",
  sideFlowerbedEdging:
    "Continues the front edging treatment down the sides for a finished look — or economize here where few people walk.",
  patioPerimeterWall:
    "A 1'-high brick knee wall around the patio defines the outdoor room and doubles as overflow seating at parties.",
  windowPlanterBoxes:
    "Flower boxes under first-floor windows add instant cottage charm. Get them sized to the exact window width and plan a hose bib nearby — they dry out fast.",

  // ── additional space ──────────────────────────────────────────
  finishedThirdFloor:
    "Finishing the attic is the cheapest square footage in the house — the roof and floor already exist. Needs code-height ceilings, egress windows (dormers help), and conditioned air. A guest room + bath up there adds real appraisal value.",
  finishedSpaceOverGarage:
    "The 'FROG' (finished room over garage) is a natural bonus room, gym, or guest suite with its own privacy. Insulate the garage ceiling well — it sits over unconditioned space.",
  sunroom:
    "A glass-walled room captures light year-round. Put it on the south or east side for gentle sun; a west-facing sunroom overheats on summer afternoons.",
  finishedBasement:
    "Roughly half the cost per square foot of building up. Plan ceiling height (9' foundation walls), egress windows, and moisture control now — those can't be added later.",
  breezeway:
    "The covered connector between house and detached garage. Enclosed becomes a true mudroom; open is the classic 'dogtrot' look that keeps the garage reading as a separate historic outbuilding.",

  // ── flooring ──────────────────────────────────────────────────
  firstFloorFlooring: FLOOR_CHOICE,
  mudRoomFlooring:
    "The mudroom takes boots, salt, and wet dogs — tile beats wood here. Checkerboard marble and basketweave mosaics are period-correct and hide dirt between cleanings.",
  powderBathFlooring: BATH_FLOOR,
  firstFloorStaircaseFlooring: STAIR_FLOOR,
  secondFloorStaircaseFlooring: STAIR_FLOOR,
  upstairsHallwayFlooring:
    "Continuing hardwood down the hall reads custom; carpet quiets footsteps over bedrooms below. Many buyers run wood in the hall and carpet only inside bedrooms.",
  bedroomFlooring:
    "Hardwood is the resale favorite and ages with the house; carpet is warmer underfoot on winter mornings and cheaper upfront. Area rugs over wood split the difference.",
  bath1Flooring: BATH_FLOOR,
  bath2Flooring: BATH_FLOOR,
  primaryBathFlooring: BATH_FLOOR,

  // ── staircase ─────────────────────────────────────────────────
  balusters:
    "Balusters (the vertical spindles) set the stair's style. Slender vase-and-column turning is Georgian; square with a chamfered edge is restrained Federal; doubling two per tread is a Greek Revival signature.",
  newels:
    "The newel is the heavy post anchoring the rail at the bottom — the handshake of the house. Match its style to your balusters and trim package.",
  handrail:
    "Oak takes stain beautifully and wears smooth, not shabby, under decades of hands. A continuous over-the-post rail is the high-end detail.",
  roundedStartingStep:
    "A bullnose first tread that curls around the newel — it widens the stair's welcome and is a hallmark of formal colonial foyers.",

  // ── trim ──────────────────────────────────────────────────────
  baseboard:
    "The board where wall meets floor. Colonial-era baseboards are tall — 5–8 inches with a profiled cap. Georgian is boldest, Federal more delicate, Greek Revival plain but very tall; builder grade is a 3-inch ranch profile.",
  crownMolding:
    "Molding at the wall-ceiling joint that 'crowns' a room. Profiles follow the same style logic as baseboard — and it matters most in public rooms with 9'+ ceilings.",
  windowCasingsFirstFloor:
    "Interior trim around windows. First-floor rooms are where guests look — wider, profiled casings here echo the home's architectural style.",
  doorCasings:
    "Trim around interior doors, normally matching the window casings so the room reads as one designed set.",
  diningRoomCasing: CASING_UPGRADE,
  officeCasing: CASING_UPGRADE,
  mainHallwayCasing: CASING_UPGRADE,
  diningRoomTrimDetail:
    "Chair rail alone protects plaster from chair backs at ~36 inches. Adding raised or recessed paneling (wainscoting) below it is the full formal-dining treatment.",

  // ── trim by room ──────────────────────────────────────────────
  diningRoomTrimByRoom: TRIM_BY_ROOM,
  officeTrimByRoom: TRIM_BY_ROOM,
  foyerTrimByRoom: TRIM_BY_ROOM,
  kitchenTrimByRoom: TRIM_BY_ROOM,
  livingRoomTrimByRoom: TRIM_BY_ROOM,
  powderBathTrimByRoom: TRIM_BY_ROOM,
  upstairsHallwayTrimByRoom: TRIM_BY_ROOM,
  primaryBedroomTrimByRoom: TRIM_BY_ROOM,
  bed1TrimByRoom: TRIM_BY_ROOM,
  bed2TrimByRoom: TRIM_BY_ROOM,
  bed3TrimByRoom: TRIM_BY_ROOM,
  primaryBathTrimByRoom: TRIM_BY_ROOM,
  bath1TrimByRoom: TRIM_BY_ROOM,
  bath2TrimByRoom: TRIM_BY_ROOM,
  bath3TrimByRoom: TRIM_BY_ROOM,

  // ── interior doors ────────────────────────────────────────────
  doorQuality:
    "Six-panel doors are the colonial standard. Hollow-core is light and inexpensive but sounds it; solid-core costs ~$60–100 more per door and buys real sound privacy and a satisfying, substantial close — most noticeable on bedrooms and baths.",
  doorHardware:
    "Knobs and hinges you touch every day. Unlacquered brass ages to a living patina (very period-correct); bronze reads darker and quieter. Levels step up in weight, mechanism, and finish durability.",

  // ── kitchen ───────────────────────────────────────────────────
  kitchenCabinetStyle:
    "The door style sets the kitchen's whole character. Recessed (Shaker-like) panels are timeless and easiest to clean; raised panels are more formal Georgian; glass and mullion doors display china and break up a wall of wood.",
  kitchenCabinetMaterial:
    "MDF is stable and paints glass-smooth (best for painted kitchens). Poplar is the paint-grade hardwood; cherry is the stain-grade heirloom that deepens in color with sunlight.",
  kitchenLayout:
    "A butler's pantry — a fitted passage between kitchen and dining with counter, storage, and often a sink — is the great colonial luxury: staging space for entertaining and a hiding place for small appliances.",
  kitchenHardwareDrawers:
    "Drawer pulls take the most force — choose solid (not hollow) hardware. Cup pulls and bar pulls in brass or bronze are the traditional picks. Levels step up in weight and finish quality.",
  kitchenHardwareDoors:
    "Door knobs can match or deliberately mix with drawer pulls (knobs on doors, pulls on drawers is classic practice). Keep one finish family across the room.",
  builtInFridgeFreezer:
    "Built-in or panel-ready refrigeration sits flush with cabinetry and can disappear behind matching panels — a major line item ($8K–$15K+) that transforms how custom the kitchen looks.",
  butlersPantryCabinetStyle:
    "The butler's pantry can match the kitchen or go bolder — glass-front uppers for glassware are traditional, and a contrasting color makes it a jewel box.",
  butlersPantryCabinetMaterial:
    "Same logic as the kitchen: MDF or poplar for painted, cherry for stained. A stained-wood pantry against a painted kitchen is a classic high-end move.",
  fridge:
    "Counter-depth or built-in units sit flush and keep the room's lines clean; standard-depth gives the most capacity per dollar but protrudes ~6 inches.",
  dishwasher:
    "A panel-ready ('built-in') dishwasher hides behind a cabinet door front for a furniture look. Check noise ratings — under 44 dBA is silent enough for open plans.",
  cooktop:
    "Gas gives instant visual control (needs the gas line from your utilities plan); electric/induction is flatter, safer, and easier to clean — induction now out-performs gas. 'Custom' covers ranges like La Cornue or AGA as the kitchen's centerpiece.",
  rangeHood:
    "The hood is the kitchen's mantelpiece. A custom plastered or wood-paneled hood hides the blower and anchors the room; size it wider than the cooktop and duct it outside (not recirculating) if possible.",
  washerDryer:
    "Side-by-side under a counter gives folding space above; stackables free floor area for a sink or drying rod. Locate near bedrooms to save years of stair-climbing with baskets.",

  // ── countertops ───────────────────────────────────────────────
  kitchenCountertopMaterial: COUNTER_MATERIAL,
  islandCountertops:
    "The island can contrast the perimeter — butcher block warms a marble kitchen and is kind to knives, while a durable quartzite island takes the daily abuse where homework and dinner happen.",
  kitchenCountertopEdge: COUNTER_EDGE,
  butlersPantryCountertopMaterial: COUNTER_MATERIAL,
  butlersPantryCountertopEdge: COUNTER_EDGE,
  powderBathCountertopMaterial: COUNTER_MATERIAL,
  powderBathCountertopEdge: COUNTER_EDGE,
  primaryBathCountertopMaterial: COUNTER_MATERIAL,
  primaryBathCountertopEdge: COUNTER_EDGE,
  bath1CountertopMaterial: COUNTER_MATERIAL,
  bath1CountertopEdge: COUNTER_EDGE,
  bath2CountertopMaterial: COUNTER_MATERIAL,
  bath2CountertopEdge: COUNTER_EDGE,
  laundryRoomCountertop:
    "A counter over front-load machines becomes the folding station. This is a great place to use a remnant slab from the kitchen or bath fabrication — ask your fabricator.",
  kitchenBacksplash:
    "Protects the wall behind the range and sink. Subway tile is the timeless value pick; running the countertop slab up the wall is the seamless luxury move.",

  // ── bath cabinets / plumbing / mirrors ────────────────────────
  powderRoomVanity:
    "Guests see this room more than any bath in the house — a furniture-style vanity or marble-top washstand makes it memorable for modest money.",
  primaryBathCabinet: BATH_CABINET,
  bath1Cabinet: BATH_CABINET,
  bath2Cabinet: BATH_CABINET,
  bath3Cabinet: BATH_CABINET,
  toiletStyle:
    "Luxury models add comfort height (chair-level seating), elongated bowls, soft-close seats, and better flush engineering. A small daily-life upgrade you'll never regret.",
  hotWaterTank:
    "A 50-gallon electric tank is cheap and simple but can run out during back-to-back showers. Tankless heats on demand — endless hot water, lower standby cost, smaller footprint — for a higher install price (and it loves natural gas).",
  disposal:
    "An in-sink grinder for food scraps. Skip it if you're on septic (or choose a septic-rated unit) — your septic field will thank you.",
  powderBathFaucet: SINK_FAUCET,
  primaryBathSinkFaucet: SINK_FAUCET,
  bath1SinkFaucet: SINK_FAUCET,
  bath2SinkFaucet: SINK_FAUCET,
  bath3SinkFaucet: SINK_FAUCET,
  kitchenSink:
    "A single-basin under-mount (33\"+) swallows sheet pans; farmhouse/apron-front sinks in fireclay are the period showpiece. Under-mount keeps the counter wipe-down seamless.",
  kitchenSinkFaucet:
    "The most-used fixture in the house — buy quality. Bridge faucets are the colonial classic; pull-down sprayers win on function. Solid brass construction outlasts everything else.",
  primaryTubShower:
    "The primary bath splurge: a freestanding soaking tub plus a separate tile shower is the full custom treatment. If you'll never bathe, a large walk-in shower spends the money better.",
  bath1TubShower: TUB_SHOWER,
  bath2TubShower: TUB_SHOWER,
  bath3TubShower: TUB_SHOWER,
  primaryShowerFaucet: SHOWER_FAUCET,
  bath1ShowerFaucet: SHOWER_FAUCET,
  bath2ShowerFaucet: SHOWER_FAUCET,
  bath3ShowerFaucet: SHOWER_FAUCET,
  powderBathMirror: BATH_MIRROR,
  primaryMirror: BATH_MIRROR,
  bath1Mirror: BATH_MIRROR,
  bath2Mirror: BATH_MIRROR,
  bath3Mirror: BATH_MIRROR,
  powderBathHardware: BATH_HARDWARE,
  primaryBathHardware: BATH_HARDWARE,
  bath1Hardware: BATH_HARDWARE,
  bath2Hardware: BATH_HARDWARE,
  bath3Hardware: BATH_HARDWARE,

  // ── shelving & built-ins ──────────────────────────────────────
  livingRoomBuiltIns:
    "Bookcases and cabinets flanking the fireplace are a colonial signature — they add architecture, storage, and resale appeal for the cost of good carpentry.",
  mudRoomBuiltIns:
    "Lockers, a bench, hooks, and a boot tray turn the family entrance into a system. Per-person cubbies keep the daily flood of bags and shoes off the floor.",
  laundryRoomBuiltIns:
    "Uppers over the machines, a hanging rod, and a folding counter make laundry a one-room operation instead of a hallway project.",
  hallwayBuiltIns:
    "A linen press or window-seat bookcase puts dead hallway space to work — towels and games live behind doors instead of in bedroom closets.",
  masterBedroomCloset:
    "A fitted closet system (double-hang, shelves, drawers) roughly doubles usable capacity versus a single rod and shelf. Cheaper installed during the build than retrofitted.",

  // ── electrical & lighting ─────────────────────────────────────
  foyerLightFixture:
    "The foyer fixture is the home's jewelry — a lantern or small chandelier hung so its bottom clears about 7' (or centered in a two-story foyer window). Size: foyer length + width in feet ≈ fixture diameter in inches.",
  kitchenLightFixture:
    "Layer it: pendants over the island for task light plus recessed cans for general light. Two or three pendants sized to the island length is the classic arrangement.",
  diningRoomLightFixture:
    "A chandelier centered on the table, about 30–34 inches above it, sized roughly half to two-thirds the table width. Always on a dimmer.",
  livingRoomLightFixture:
    "Colonial living rooms historically relied on lamps — a center fixture or recessed cans on dimmers plus switched outlets for lamps gives flexible, layered light.",
  powderBathLightOverMirror: OVER_MIRROR_LIGHT,
  powderBathLightCeiling: CEILING_LIGHT,
  primaryBathLightOverMirror: OVER_MIRROR_LIGHT,
  primaryBathLightCeiling: CEILING_LIGHT,
  bath1LightOverMirror: OVER_MIRROR_LIGHT,
  bath1LightCeiling: CEILING_LIGHT,
  bath2LightOverMirror: OVER_MIRROR_LIGHT,
  bath2LightCeiling: CEILING_LIGHT,
  bath3LightOverMirror: OVER_MIRROR_LIGHT,
  bath3LightCeiling: CEILING_LIGHT,
  frontPorchLight: EXTERIOR_LIGHT,
  rearDoorLight: EXTERIOR_LIGHT,
  sideDoorLight: EXTERIOR_LIGHT,
  exteriorGarageLights: EXTERIOR_LIGHT,
  surroundSoundOutdoor: SURROUND_SOUND,
  surroundSoundFirstFloor: SURROUND_SOUND,
  surroundSoundKitchenLiving: SURROUND_SOUND,

  // ── HVAC ──────────────────────────────────────────────────────
  floorReturns:
    "Return-air grilles in the floor pull air back to the system. Metal grilles are the commodity option; oak returns — raised or inlaid flush into the hardwood — disappear into the floor and are a small price for a custom look.",
  hvacSystem:
    "One 5-ton system is simpler and cheaper, but a single thermostat rules the whole house. Two 2.5-ton systems (dual zone) let upstairs and downstairs run independently — bedrooms cool at night without freezing the first floor, and you have a backup if one fails.",
  airPurification:
    "Whole-home filtration (media filters, UV, or electronic air cleaners) mounts at the air handler and treats every room — worth considering for allergies and tight, well-sealed new homes.",
  smartThermostat:
    "Learns schedules, adjusts remotely, and reports energy use. With dual-zone systems, smart thermostats coordinate the two halves of the house intelligently.",
  dehumidifier:
    "A whole-home dehumidifier holds the house at ~50% humidity even when it's too mild for the AC to run — vital for crawlspaces, basements, and humid summers. Protects wood floors and trim.",
  freshAirVentilation:
    "Tight new homes need deliberate fresh air. An ERV/HRV exchanges stale inside air for filtered outside air while recovering the heat — better air quality without throwing away the energy you paid for.",
};
