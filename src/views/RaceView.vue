<template>
  <div class="race-view">
    <svg
      ref="svgRef"
      width="100%"
      height="100%"
      viewBox="0 0 60 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      @click="getCoordinates"
      id="track"
    >
      <race-track />

      <!-- Mostrar los 9 posibles siguientes puntos -->
      <circle
        v-for="(point, index) in nextPoints"
        :key="'nextPoint' + index"
        :cx="point.x"
        :cy="point.y"
        r="0.4"
        fill="cadetblue"
        @click="clickPossiblePositions(index)"
      />

      <!-- Dibujar círculos en los puntos de la trayectoria -->
      <!-- trayectoria -->
      <polyline :points="pathPoints" fill="none" stroke="blue" stroke-width="0.3" />
      <circle
        v-for="(p, index) in path"
        :key="'circle' + index"
        :cx="p.x"
        :cy="p.y"
        r="0.2"
        fill="blue"
      />
    </svg>
    <div>
      <Button icon="pi pi-circle" @click="move(-1, -1)" />
      <Button icon="pi pi-circle" @click="move(0, -1)" />
      <Button icon="pi pi-circle" @click="move(1, -1)" />
    </div>
    <div>
      <Button icon="pi pi-circle" @click="move(-1, 0)" />
      <Button icon="pi pi-circle" @click="move(0, 0)" />
      <Button icon="pi pi-circle" @click="move(1, 0)" />
    </div>
    <div>
      <Button icon="pi pi-circle" @click="move(-1, 1)" />
      <Button icon="pi pi-circle" @click="move(0, 1)" />
      <Button icon="pi pi-circle" @click="move(1, 1)" />
    </div>
  </div>
</template>

<style scoped>
.race-view {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #e6f9d4;
  padding: 40px;
}
</style>

<script setup lang="ts">
import { computed, ref } from 'vue'
import Button from 'primevue/button'
import RaceTrack from '@/components/RaceTrack.vue'

//Toast Management
import { useToast } from 'primevue/usetoast'
const toast = useToast()

//Variables for movement
const position = ref({ x: 26, y: 36 })
const velocity = ref({ x: 0, y: 0 })
const path = ref([{ x: 26, y: 36 }])

// Set of points for the <polyline> with the trajectory
const pathPoints = computed(() => path.value.map((p) => `${p.x},${p.y}`).join(' '))

// Variable with the new possible points based on the current position and velocity
const nextPoints = computed(() => {
  const points = []

  // calculate the new position based on the current position and velocity
  const newPos = {
    x: position.value.x + velocity.value.x,
    y: position.value.y + velocity.value.y,
  }

  // Define the possible points around the new position
  for (let ax = -1; ax <= 1; ax++) {
    for (let ay = -1; ay <= 1; ay++) {
      const nextX = newPos.x + ax
      const nextY = newPos.y + ay
      if (nextX >= 0 && nextX < 60 && nextY >= 0 && nextY < 40) {
        points.push({ x: nextX, y: nextY })
      }
    }
  }
  return points
})

const svgRef = ref<SVGSVGElement | null>(null)

// clickPossiblePositions(index)
// =======================================================================
// Function to move the car based on the index of the clicked possible
// point

function clickPossiblePositions(index: number) {
  //DEBUG
  //console.log('Punto:', index)

  switch (index) {
    case 0:
      move(-1, -1)
      break
    case 1:
      move(-1, 0)
      break
    case 2:
      move(-1, 1)
      break
    case 3:
      move(0, -1)
      break
    case 4:
      move(0, 0)
      break
    case 5:
      move(0, 1)
      break
    case 6:
      move(1, -1)
      break
    case 7:
      move(1, 0)
      break
    case 8:
      move(1, 1)
      break
    default:
      //DEBUG
      console.log('Invalid index')
  }
}

// move(aceleration)
// =======================================================================
// Function to move the car based on acceleration

function move(ax: number, ay: number) {
  // New Velocity
  velocity.value.x += ax
  velocity.value.y += ay

  // New Position
  position.value.x += velocity.value.x
  position.value.y += velocity.value.y

  // New position is saved in the path
  path.value.push({ ...position.value })

  // Check if the new position is inside the track
  isPointInsideTrack(position.value)
}

// isPointInsideTrack(point)
// =======================================================================
// Function to calculate if the point is inside the track

function isPointInsideTrack(point: { x: number; y: number }) {
  const track = document.getElementById('track')
  const innerLine = document.getElementById('inner-line')
  const outterLine = document.getElementById('outter-line')
  const svg = document.getElementsByTagName('svg')[0]

  if (!track || !innerLine || !outterLine) {
    //DEBUG
    console.error('Track or lines are not available.')
    return false
  }

  const pointObj = svg.createSVGPoint()
  pointObj.x = point.x
  pointObj.y = point.y

  const insideOutter = outterLine.isPointInFill(pointObj)
  const insideInner = innerLine.isPointInFill(pointObj)

  //DEBUG
  //console.log('insideOutter:', insideOutter)
  //console.log('insideInner:', insideInner)

  if (insideOutter && !insideInner) {
    //DEBUG
    //console.log('Dentro del circuito')
    return true
  } else {
    //DEBUG
    //console.log('Fuera del circuito')
    toast.add({
      severity: 'error',
      summary: 'Outside of the track',
      detail: 'The last point moved you outside of the track',
      life: 3000,
    })
    return false
  }
}

/*
Debug functions
=====================================================================
declare global {
  interface Window {
    dibujarPunto: (x: number, y: number) => void
  }
}

function getCoordinates(event: MouseEvent) {
  const svg = svgRef.value
  if (!svg) {
    console.error('SVG element is not available.')
    return
  }
  const point = svg.createSVGPoint()
  point.x = event.clientX
  point.y = event.clientY
  const screenCTM = svg.getScreenCTM()
  if (!screenCTM) {
    console.error('Screen CTM is not available.')
    return
  }
  const svgPoint = point.matrixTransform(screenCTM.inverse())

  console.log(`Coordinates: (${svgPoint.x}, ${svgPoint.y})`)
}

*/
</script>
