// Scene metadata (images live in public/scenes). Word lists are server-side.
export interface Scene { key: string; name: string; image: string }
export const SCENES: Scene[] = [
  { key: 'park', name: 'The Park', image: '/scenes/park.jpg' },
  { key: 'beach', name: 'The Beach', image: '/scenes/beach.jpg' },
  { key: 'theater', name: 'Backstage', image: '/scenes/theater.jpg' },
  { key: 'railway', name: 'Victoria Station', image: '/scenes/railway.jpg' },
  { key: 'hospital', name: 'The Hospital', image: '/scenes/hospital.jpg' },
]
export const sceneByKey = (k: string) => SCENES.find((s) => s.key === k)
