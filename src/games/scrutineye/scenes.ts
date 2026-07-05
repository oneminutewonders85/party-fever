// Scene metadata (images live in public/scenes). Word lists are server-side.
export interface Scene { key: string; name: string; image: string }
export const SCENES: Scene[] = [
  { key: 'park', name: 'The Park', image: '/scenes/park.jpg' },
  { key: 'beach', name: 'The Beach', image: '/scenes/beach.jpg' },
  { key: 'theater', name: 'Backstage', image: '/scenes/theater.jpg' },
  { key: 'railway', name: 'Victoria Station', image: '/scenes/railway.jpg' },
  { key: 'hospital', name: 'The Hospital', image: '/scenes/hospital.jpg' },
  { key: 'amusement', name: 'Amusement Park', image: '/scenes/amusement.jpg' },
  { key: 'excavation', name: 'Excavation Site', image: '/scenes/excavation.jpg' },
  { key: 'atlantis', name: 'Atlantis', image: '/scenes/atlantis.jpg' },
  { key: 'castle', name: 'Feudal Castle', image: '/scenes/castle.jpg' },
  { key: 'bazaar', name: 'Global Bazaar', image: '/scenes/bazaar.jpg' },
  { key: 'lostcity', name: 'Lost City', image: '/scenes/lostcity.jpg' },
  { key: 'museum', name: 'The Museum', image: '/scenes/museum.jpg' },
  { key: 'spacelab', name: 'Space Lab', image: '/scenes/spacelab.jpg' },
  { key: 'toyshop', name: 'Toy Shop', image: '/scenes/toyshop.jpg' },
]
export const sceneByKey = (k: string) => SCENES.find((s) => s.key === k)
