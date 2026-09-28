/**
 * Verified SYMC content migrated from https://www.symc.com.tr/ (audited 2026-09-28).
 *
 * Every sentence, project, yacht name, length, year and scope item below comes
 * from the live site (pages: /, /about/, /new-construction/,
 * /project-management-and-consultancy/, /retrofit-refit-services/,
 * /yacht-management-service/, /completed-projects/, /contact/) or the
 * "SYMC Completed Projects" PDF in its media library. Only spelling and
 * grammar were lightly corrected. Unknown values are left empty on purpose.
 */

export const settings = {
  companyName: "SYMC",
  alternateName: "SYMC YACHT | SYMC Superyacht Management & Consultancy",
  tagline: "There is someone who cares about your yacht.",
  description:
    "SYMC is a Superyacht Management and Consultancy company founded in 2020 and based in Tuzla, Istanbul, providing new construction management, project management and consultancy, refit services and yacht management.",
  foundingYear: 2020,
  phone: "+90 549 301 17 03",
  email: "info@symc.com.tr",
  streetAddress: "İstasyon Mah., Çiçekçiler Cad. No:21/D",
  addressLocality: "Tuzla",
  addressRegion: "İstanbul",
  postalCode: "",
  addressCountry: "TR",
  openingHours: "Mon to Fri: 8am – 6pm · 24/7 service",
  openingHoursSpec: "Mo-Fr 08:00-18:00",
  // Place id taken from the Google Maps embed on the live /contact/ page ("SYMC Yacht").
  googleMapsUrl: "https://maps.google.com/?cid=15638034300552808695",
  googleMapsEmbedUrl:
    "https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d10156.15904266147!2d29.313132818077637!3d40.81820697983987!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0xd9057557add308f7!2sSYMC%20Yacht!5e0!3m2!1str!2str!4v1660838042190!5m2!1str!2str",
  instagramUrl: "https://www.instagram.com/symc_official/",
  linkedinUrl: "https://www.linkedin.com/company/symc-superyacht-management-and-consultancy/",
  youtubeUrl: "",
  whatsappUrl: "https://wa.me/905493011703",
  footerText: "Superyacht Management & Consultancy — Refit | Repair | New Build",
  defaultSeoTitle: "SYMC YACHT – Superyacht Management & Consultancy",
  defaultSeoDescription:
    "SYMC is a Superyacht Management and Consultancy company in Tuzla, Istanbul: new construction management, project management and consultancy, refit services and yacht management.",
};

export const HOME_HERO_KEY = "site/superyacht-at-shipyard-quay-sunset.jpg";

export const projectCategories = [
  {
    slug: "new-construction",
    name: "New Construction",
    sortOrder: 1,
    description:
      "Building a superyacht is a long journey for all the parties included. Building a good yacht requires experience, good engineering, eye for detail, budget and people management skills, but above all a passion for yacht building.",
  },
  {
    slug: "refit",
    name: "Refit Projects",
    sortOrder: 2,
    description: "Refits carried out and managed by SYMC.",
  },
];

export type SeedService = {
  slug: string;
  title: string;
  sortOrder: number;
  featured: boolean;
  shortDescription: string;
  content: string;
  highlights: string[];
  seoTitle: string;
  seoDescription: string;
  heroKey: string | null;
  galleryKeys: string[];
  createdAt: string;
  updatedAt: string;
};

// createdAt/updatedAt = original WordPress page dates (real lastmod values).
export const services: SeedService[] = [
  {
    slug: "new-construction",
    title: "New Construction",
    sortOrder: 1,
    featured: true,
    shortDescription:
      "Building a superyacht is a long journey for all the parties included. Building a good yacht requires experience, good engineering, eye for detail, budget and people management skills, but above all a passion for yacht building.",
    content:
      "<p>Building a superyacht is a long journey for all the parties included. Building a good yacht requires experience, good engineering, eye for detail, budget and people management skills, but above all a passion for yacht building.</p><p>At SYMC, we are engineers who share the excitement of building a good yacht with the boat owner, and we combine all of our experience and good engineering with that excitement to make the owner’s needs and wishes come true.</p>",
    highlights: [],
    seoTitle: "Superyacht New Construction",
    seoDescription:
      "SYMC engineers accompany superyacht new builds with experience, good engineering, an eye for detail, and budget and people management skills.",
    heroKey: "services/new-construction/superyacht-hull-on-shipyard-transporter.jpg",
    galleryKeys: [
      "services/new-construction/newbuild-superstructure-scaffolding-construction-hall.jpg",
      "services/new-construction/steel-hull-bow-under-construction.jpg",
      "services/new-construction/aluminium-hull-plating-construction-hall.jpg",
      "services/new-construction/steel-hull-block-in-construction-hall.jpg",
    ],
    createdAt: "2022-08-12T20:37:00+03:00",
    updatedAt: "2022-08-18T20:45:53+03:00",
  },
  {
    slug: "project-management-and-consultancy",
    title: "Project Management and Consultancy",
    sortOrder: 2,
    featured: true,
    shortDescription:
      "SYMC’s team includes project managers and project management office managers with shipyard experience. When it comes to managing a project with the right budget, right quality, right equipment choices and right cash flow, you are at the right place.",
    content:
      "<p>SYMC’s team includes project managers and project management office managers with shipyard experience. Because of that, when it comes to managing a project with the right budget, right quality, right equipment choices and right cash flow, you are at the right place.</p><h2>New Build Management</h2><p>With our years of experience as a project manager and marine surveyor, SYMC is the right choice to manage your new build projects. While you are waiting for your new boat, SYMC will manage and check everything during the construction, outfitting and finalising phases. At the end of the day, you will have one state-of-the-art beauty with all your desires fitted in. SYMC will be the trusted partner and representative between you and the shipyard.</p><p>We closely supervise your newbuilding project in respect of its conformity to the Building Technical Specifications and the approved drawings, production progress, production quality, ship performance, compliance with rules, regulations, codes and conventions, actual completion status, reasons for delay, findings and rectification actions.</p><p>Any outstanding issues that may adversely affect the building schedule are immediately brought to the attention of the owners and the Project Manager.</p>",
    highlights: [
      "Conformity to the Building Technical Specifications and approved drawings",
      "Production progress",
      "Production quality",
      "Ship performance",
      "Compliance with rules, regulations, codes and conventions",
      "Actual completion status",
      "Reasons for delay",
      "Findings and rectification actions",
    ],
    seoTitle: "Yacht Project Management & Consultancy",
    seoDescription:
      "Project managers with shipyard experience managing superyacht projects with the right budget, quality, equipment choices and cash flow — including new build supervision.",
    heroKey: "services/project-management-and-consultancy/measurement-during-yacht-inspection.jpg",
    galleryKeys: [
      "services/project-management-and-consultancy/site-supervision-steel-hull-construction.jpg",
      "services/project-management-and-consultancy/yacht-superstructure-outfitting-scaffolding.jpg",
    ],
    createdAt: "2022-08-06T22:28:15+03:00",
    updatedAt: "2022-08-18T21:27:49+03:00",
  },
  {
    slug: "retrofit-refit-services",
    title: "Refit Services",
    sortOrder: 3,
    featured: true,
    shortDescription:
      "SYMC works with the biggest solution partners of the Turkish yacht building industry. That’s why, when your yacht needs care, we can offer you the best work quality at the right time.",
    content:
      "<p>SYMC works with the biggest solution partners of the Turkish Yacht Building Industry. That’s why, when your beauty needs care, we can offer you the best work quality at the right time. All you have to do is plan your next vacation with your renewed boat.</p><p>SYMC is able to satisfy every request, guaranteeing a complete service — timeliness and precision for any problem with your yacht.</p><p>Professionalism, dedication and passion are the prerequisites for being part of the SYMC family; whether maintenance, service or refit, we are available 24/7.</p>",
    highlights: [],
    seoTitle: "Yacht Refit Services",
    seoDescription:
      "Superyacht refit, maintenance and service with the biggest solution partners of the Turkish yacht building industry — available 24/7.",
    heroKey: "services/refit-services/superyacht-haul-out-travel-lift.jpg",
    galleryKeys: [
      "services/refit-services/superyacht-hull-on-hardstand-refit.jpg",
      "services/refit-services/motor-yacht-lifted-from-water.jpg",
      "services/refit-services/yachts-in-refit-shed.jpg",
      "services/refit-services/motor-yacht-under-way.jpg",
      "services/refit-services/motor-yacht-at-anchor-coastline.jpg",
    ],
    createdAt: "2022-08-06T22:27:31+03:00",
    updatedAt: "2022-08-18T20:45:17+03:00",
  },
  {
    slug: "yacht-management-service",
    title: "Yacht Management Service",
    sortOrder: 4,
    featured: true,
    shortDescription:
      "Being the owner of a yacht is completely different from managing it. Every yacht is one of a kind — and needs special care from professionals who understand all aspects of the yacht and its crew.",
    content:
      "<p>Being an owner of a yacht is completely different from managing it. You need to understand all aspects of the yacht and crew needs, and you also need to re-discover these needs for every new yacht, because every yacht is one of a kind.</p><p>For these reasons your yacht needs special care from someone professional. As SYMC, we are at your service with our completely specialised personnel. Our complete list of services is below.</p>",
    highlights: [
      "24/7 shore-side emergency response",
      "Registration and corporate services liaison",
      "Accounting",
      "Purchasing",
      "Logistics",
      "ISM & ISPS services — including provision of DPA and CSO",
      "Mini-ISM for yachts under 500 GT",
      "Payroll",
      "Marine and crew insurance administration",
      "Cruising itinerary and travel advice",
      "Crew administration, including MLC compliance",
      "Technical management",
      "Survey planning, scheduling and orchestration",
      "Compliance",
      "Refit management",
      "Crew search",
    ],
    seoTitle: "Yacht Management Services",
    seoDescription:
      "Complete yacht management by SYMC: 24/7 emergency response, ISM & ISPS, crew administration and MLC compliance, technical management, surveys, compliance and refit management.",
    heroKey: "site/motor-yacht-moored-alongside-quay.jpg",
    galleryKeys: [],
    createdAt: "2022-08-12T20:35:37+03:00",
    updatedAt: "2022-08-18T19:12:45+03:00",
  },
];

export type SeedProject = {
  slug: string;
  title: string;
  category: "new-construction" | "refit";
  status: "COMPLETED" | "IN_PROGRESS";
  featured: boolean;
  sortOrder: number;
  yachtName: string | null;
  yachtType: string | null;
  length: string | null;
  location: string | null;
  projectYear: number | null;
  shortDescription: string;
  content: string;
  scopeItems: string[];
  services: string[];
  seoTitle: string | null;
  seoDescription: string;
  coverKey: string | null;
  galleryKeys: string[];
};

export const projects: SeedProject[] = [
  {
    slug: "my-mereley-35m",
    title: "M/Y Mereley 35m",
    category: "new-construction",
    status: "IN_PROGRESS",
    featured: true,
    sortOrder: 1,
    yachtName: "M/Y Mereley",
    yachtType: null,
    length: "35 m",
    location: "Kocaeli, Türkiye",
    projectYear: null,
    shortDescription:
      "The M/Y Mereley project is being built at Kocaeli. Its construction continues, with all of its operations controlled by SYMC.",
    content:
      "<p>The M/Y Mereley project is being built at Kocaeli, and its construction continues, with all of its operations being controlled by us.</p><p>Our teammates are experts in the works to be done, controlled and managed on the boat — from the welding process, steel and aluminium workmanship and the interior, to the technical design process, engine room equipment installation, piping, paint preparation and application control, insulation control, the application and commissioning of electrical and electronic equipment, and class and flag relations.</p>",
    scopeItems: [
      "Welding process",
      "Steel and aluminium workmanship",
      "Interior",
      "Technical design process",
      "Engine room equipment installation",
      "Piping",
      "Paint preparation and application control",
      "Insulation control",
      "Electrical and electronic equipment — application and commissioning",
      "Class and flag relations",
    ],
    services: ["new-construction", "project-management-and-consultancy"],
    seoTitle: "M/Y Mereley 35m – New Construction",
    seoDescription:
      "M/Y Mereley, a 35 m yacht under construction at Kocaeli, with all operations controlled by SYMC: welding, steel and aluminium work, interior, engine room, piping, paint, class and flag.",
    coverKey: "projects/my-mereley-35m/my-mereley-35m-exterior-visual.jpg",
    galleryKeys: [
      "projects/my-mereley-35m/my-mereley-35m-aft-deck-and-spa-pool-visual.jpg",
      "projects/my-mereley-35m/my-mereley-35m-main-saloon-visual.jpg",
      "projects/my-mereley-35m/my-mereley-35m-guest-cabin-visual.jpg",
      "projects/my-mereley-35m/my-mereley-35m-marble-bathroom-visual.jpg",
    ],
  },
  {
    slug: "tisg-new-construction-projects",
    title: "TISG New Construction Projects",
    category: "new-construction",
    status: "COMPLETED",
    featured: false,
    sortOrder: 2,
    yachtName: null,
    yachtType: null,
    length: null,
    location: "Türkiye",
    projectYear: null,
    shortDescription:
      "Eight yacht hulls built in Türkiye (with installation of some equipment and painting). All controls between production and customer delivery were inspected and reported by SYMC.",
    content:
      "<p>In these projects, which were built as hulls (with installation of some equipment and painting) in Türkiye, all the controls between production and customer delivery were inspected and reported with the necessary equipment by our teammates.</p><h2>Hulls</h2><ul><li>M/Y NB 596 — 72 m, steel + aluminium</li><li>M/Y NB 597 — 100 m, steel + aluminium</li><li>M/Y NB 598 — 72 m, steel + aluminium</li><li>M/Y NB 603 — 56 m, aluminium</li><li>M/Y NB 604 — 82 m, steel + aluminium</li><li>M/Y NB 606 — 53 m, steel + aluminium</li><li>M/Y NB 607 — 53 m, steel + aluminium</li><li>M/Y NB 608 — 24 m, aluminium</li></ul>",
    scopeItems: [
      "Inspection of all controls between production and customer delivery",
      "Reporting with the necessary equipment",
    ],
    services: ["new-construction", "project-management-and-consultancy"],
    seoTitle: null,
    seoDescription:
      "TISG new construction projects: eight yacht hulls from 24 m to 100 m in steel and aluminium, built in Türkiye, with production-to-delivery controls inspected and reported by SYMC.",
    coverKey: null,
    galleryKeys: [],
  },
  {
    slug: "my-mmm-49-2m",
    title: "M/Y MMM 49.2m",
    category: "refit",
    status: "COMPLETED",
    featured: true,
    sortOrder: 3,
    yachtName: "M/Y MMM",
    yachtType: null,
    length: "49.2 m",
    location: null,
    projectYear: 2024,
    shortDescription:
      "M/Y MMM was fully refitted by SYMC in 2024 — from a new helideck, swimming platform and wheelhouse design to upgrades for polar voyages and a 30-year Special Survey.",
    content: "",
    scopeItems: [
      "Hull, superstructure and underwater areas painting",
      "New helideck design",
      "New swimming platform design",
      "New lighting design",
      "Swimming platform length extended and transformers added",
      "New GA layouts",
      "New main engine room layouts",
      "New lazarette layouts",
      "New stainless steel handrails",
      "New crane added at helideck",
      "Teak decks renewed in all areas",
      "New hydraulic doors added",
      "All hatches replaced with class-approved types",
      "New wheelhouse design with new navigation equipment",
      "New antenna design",
      "Upgrades for polar voyage including all safety and sailing systems",
      "New rooms added (toy room & gym)",
      "All interior areas upgraded with new design and new furniture",
      "New entertainment systems for owner and guest rooms",
      "New cabling assemblies installed for all new systems",
      "New laundry design",
      "New piping systems installed for all new systems",
      "Overhaul of main engine systems",
      "Overhaul of generator set systems",
      "Overhaul of all pumps",
      "All valves renewed",
      "Underwater lighting system added",
      "Replacement of all insulation systems",
      "Sound and vibration insulation added for new areas",
      "Overhaul of entire hydraulic system",
      "Galley door replaced with class-approved type",
      "Crew mess room renewed with new furniture",
      "All hatches and existing doors maintained",
      "All tanks sandblasted and painted with approved coating systems",
      "30-year Special Survey preparation in accordance with Flag & Class Society requirements",
      "All concrete removed from the yacht and steel structure renewed",
      "Liferafts revised and upgraded to polar type",
      "Whips system installed on both sides",
      "All windows replaced with new ones",
      "All bulwark railings and teak decks renewed",
      "Propulsion system maintained and components renewed as required",
      "Stabilizer blades maintained",
      "All drawings re-approved by Class Society",
      "All purchasing operations completed",
    ],
    services: ["retrofit-refit-services"],
    seoTitle: "M/Y MMM 49.2m – Full Refit 2024",
    seoDescription:
      "Full 2024 refit of the 49.2 m M/Y MMM by SYMC: new helideck, swimming platform and wheelhouse, polar voyage upgrades, new interiors and a 30-year Special Survey.",
    coverKey: "projects/my-mmm-49-2m/my-mmm-49-2m-after-refit-helideck.jpg",
    galleryKeys: [],
  },
  {
    slug: "my-starburst-iii-47m",
    title: "M/Y Starburst III 47m",
    category: "refit",
    status: "COMPLETED",
    featured: true,
    sortOrder: 4,
    yachtName: "M/Y Starburst III",
    yachtType: null,
    length: "47 m",
    location: null,
    projectYear: 2023,
    shortDescription:
      "M/Y Starburst III was fully refitted by SYMC in 2023, including a silicone antifouling system, new CuNiFe sea-water piping and a new lightweight survey.",
    content: "",
    scopeItems: [
      "Underwater painting system changed to silicone antifouling system",
      "New piping system for sea water (CuNiFe)",
      "Overhaul of main engine system",
      "Overhaul of 3 gen-set systems",
      "Overhaul of all pumps",
      "All valves changed to classed type",
      "Replacement of exhaust pipe insulation for main engines",
      "Overhaul of hydraulic system",
      "Overhaul of all exterior tables",
      "Galley floor changed with new system",
      "Crew mess room upgrades",
      "ECDIS upgraded to a new paperless system",
      "All sea chest lids changed",
      "All hatches maintained",
      "Grey water tank sandblasted and painted",
      "5-year Special Survey preparation of Flag & Class Society requirements",
      "Load line issues solved with a new lightweight survey",
    ],
    services: ["retrofit-refit-services"],
    seoTitle: "M/Y Starburst III 47m – Refit 2023",
    seoDescription:
      "2023 refit of the 47 m M/Y Starburst III by SYMC: silicone antifouling, CuNiFe sea-water piping, main engine and gen-set overhauls, paperless ECDIS and a new lightweight survey.",
    coverKey: "projects/my-starburst-iii-47m/my-starburst-iii-47m-profile.jpg",
    galleryKeys: ["projects/my-starburst-iii-47m/my-starburst-iii-47m-propeller.jpg"],
  },
  {
    slug: "my-ileria-50m",
    title: "M/Y Ileria 50m",
    category: "refit",
    status: "COMPLETED",
    featured: false,
    sortOrder: 5,
    yachtName: "M/Y Ileria",
    yachtType: null,
    length: "50 m",
    location: null,
    projectYear: 2022,
    shortDescription: "M/Y Ileria was fully refitted by SYMC in 2022.",
    content: "",
    scopeItems: [
      "Underwater painting",
      "Overhaul of main engine system",
      "Overhaul of gen-set",
      "5-year Special Survey preparation of Flag & Class Society requirements",
    ],
    services: ["retrofit-refit-services"],
    seoTitle: "M/Y Ileria 50m – Refit 2022",
    seoDescription:
      "2022 refit of the 50 m M/Y Ileria by SYMC: underwater painting, main engine and gen-set overhaul and 5-year Special Survey preparation for Flag & Class.",
    coverKey: "projects/my-ileria-50m/my-ileria-50m-under-way.jpg",
    galleryKeys: [],
  },
  {
    slug: "my-mystere-ab",
    title: "M/Y Mystere AB",
    category: "refit",
    status: "COMPLETED",
    featured: false,
    sortOrder: 6,
    yachtName: "M/Y Mystere AB",
    yachtType: null,
    length: null,
    location: null,
    projectYear: 2022,
    shortDescription:
      "M/Y Mystere AB was fully refitted by SYMC in 2022, including the re-design and rebuild of the lazarette area after a fire.",
    content: "",
    scopeItems: [
      "Full hull & superstructure painting",
      "Underwater painting",
      "Lazarette area re-designed and rebuilt after a fire",
      "Overhaul of gen-set",
      "Overhaul of main engine system",
      "Renewal of aft section and connections",
    ],
    services: ["retrofit-refit-services"],
    seoTitle: "M/Y Mystere AB – Refit 2022",
    seoDescription:
      "2022 refit of M/Y Mystere AB by SYMC: full paint, lazarette re-designed and rebuilt after a fire, gen-set and main engine overhaul, renewed aft section.",
    coverKey: "projects/my-mystere-ab/my-mystere-ab-aft-deck-after-refit.jpg",
    galleryKeys: [
      "projects/my-mystere-ab/my-mystere-ab-lazarette-before-and-after.jpg",
      "projects/my-mystere-ab/my-mystere-ab-engine-components-overhaul.jpg",
    ],
  },
  {
    slug: "my-duke-town-36-5m",
    title: "M/Y Duke Town 36.5m",
    category: "refit",
    status: "COMPLETED",
    featured: true,
    sortOrder: 7,
    yachtName: "M/Y Duke Town",
    yachtType: null,
    length: "36.5 m",
    location: null,
    projectYear: 2021,
    shortDescription: "M/Y Duke Town was fully refitted in 2021 and is still being managed by SYMC.",
    content: "",
    scopeItems: [
      "Full hull and superstructure painting",
      "Underwater painting",
      "New gen-set installation",
      "Replacement of AMS",
      "Overhaul of main engine system",
      "Renewal of interior: master cabin, main saloon, galley, laundry",
      "5-year Special Survey preparation of Flag & Class Society requirements",
      "Replacement of entertainment system",
    ],
    services: ["retrofit-refit-services", "yacht-management-service"],
    seoTitle: "M/Y Duke Town 36.5m – Refit 2021",
    seoDescription:
      "2021 full refit of the 36.5 m M/Y Duke Town by SYMC — paint, new gen-set and AMS, engine overhaul, renewed interior — and ongoing yacht management.",
    coverKey: "projects/my-duke-town-36-5m/my-duke-town-36-5m-at-anchor.jpg",
    galleryKeys: [
      "projects/my-duke-town-36-5m/my-duke-town-36-5m-hull-paint-refit-shed.jpg",
      "projects/my-duke-town-36-5m/my-duke-town-36-5m-freshly-painted-hull.jpg",
    ],
  },
  {
    slug: "my-secret-47m",
    title: "M/Y Secret 47m",
    category: "refit",
    status: "COMPLETED",
    featured: false,
    sortOrder: 8,
    yachtName: "M/Y Secret",
    yachtType: null,
    length: "47 m",
    location: null,
    projectYear: 2021,
    shortDescription: "M/Y Secret was fully refitted by SYMC in 2021, including a full exterior design upgrade.",
    content: "",
    scopeItems: [
      "Full hull and superstructure painting",
      "Underwater painting",
      "New gen-set installation and piping renewed with new system",
      "Overhaul of main engine system",
      "Overhaul of all pumps",
      "Replacement of engine room insulation",
      "Exterior design fully upgraded with new furniture and entertainment system",
      "5-year Special Survey preparation of Flag & Class Society requirements",
    ],
    services: ["retrofit-refit-services"],
    seoTitle: "M/Y Secret 47m – Refit 2021",
    seoDescription:
      "2021 full refit of the 47 m M/Y Secret by SYMC: paint, new gen-set and piping, engine and pump overhaul, new E/R insulation and a full exterior design upgrade.",
    coverKey: "projects/my-secret-47m/my-secret-47m-under-way.jpg",
    galleryKeys: [],
  },
  {
    slug: "my-4-you-47m",
    title: "M/Y 4You 47m",
    category: "refit",
    status: "COMPLETED",
    featured: false,
    sortOrder: 9,
    yachtName: "M/Y 4You",
    yachtType: null,
    length: "47 m",
    location: null,
    projectYear: 2020,
    shortDescription: "M/Y 4You was fully refitted by SYMC in 2020, with the hull painted in Awlgrip.",
    content: "",
    scopeItems: [
      "Hull painted with Awlgrip",
      "Underwater painting",
      "Overhaul of gen-set",
      "Replacement of AMS",
      "Overhaul of main engine system",
      "Renewal of interior: master cabin, main saloon, galley, laundry",
      "5-year Special Survey preparation of Flag & Class Society requirements",
      "Replacement of entertainment system",
    ],
    services: ["retrofit-refit-services"],
    seoTitle: "M/Y 4You 47m – Refit 2020",
    seoDescription:
      "2020 full refit of the 47 m M/Y 4You by SYMC: Awlgrip hull paint, gen-set and main engine overhaul, new AMS, renewed interior and 5-year Special Survey preparation.",
    coverKey: "projects/my-4-you-47m/my-4-you-47m-under-way.jpg",
    galleryKeys: [
      "projects/my-4-you-47m/my-4-you-47m-travel-lift-haul-out.jpg",
      "projects/my-4-you-47m/my-4-you-47m-on-hardstand-transporter.jpg",
      "projects/my-4-you-47m/my-4-you-47m-stern.jpg",
      "projects/my-4-you-47m/my-4-you-47m-main-engine-and-genset-overhaul.jpg",
    ],
  },
  {
    slug: "ferretti-custom-line-navetta-42-nimir",
    title: "Ferretti Custom Line Navetta 42 “Nimir”",
    category: "refit",
    status: "COMPLETED",
    featured: false,
    sortOrder: 10,
    yachtName: "Nimir",
    yachtType: "Ferretti Custom Line Navetta 42",
    length: null,
    location: null,
    projectYear: null,
    shortDescription:
      "Refit works on the Custom Line Navetta 42 “Nimir”: interior flooring, engine room hydraulics and piping, hull fibreglass, teak decking, deck doors and navigation systems.",
    content: "",
    scopeItems: [
      "Reinstatement and renewal of parquet flooring in the main salon",
      "Renewal of flooring in the galley and corridor areas",
      "Repair of hydraulic circuits in the engine room",
      "Repair of exterior hull fibreglass surfaces",
      "Replacement of all cracked teak decking and renewal of all Sikaflex seams on all decks",
      "Rectification of leaks in engine room piping systems",
      "Overhaul, maintenance and restoration to full operational condition of exterior deck door mechanisms and frames",
      "Troubleshooting and repair of navigation systems and alarm monitoring systems",
    ],
    services: ["retrofit-refit-services"],
    seoTitle: "Custom Line Navetta 42 “Nimir” – Refit",
    seoDescription:
      "Refit of the Ferretti Custom Line Navetta 42 “Nimir” by SYMC: parquet and galley flooring, engine room hydraulics and piping, hull fibreglass, teak decks, deck doors and navigation systems.",
    coverKey: "projects/ferretti-custom-line-navetta-42-nimir/ferretti-custom-line-navetta-42-nimir.jpg",
    galleryKeys: [],
  },
];
