<template>
  <div class="race-view">
    <div class="div-track" id="div-track">
      <svg
        class="svg-track"
        ref="svgRef"
        width="100%"
        height="100%"
        viewBox="0 0 70 50"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        @click="getCoordinates"
        :style="{ transform: `scale(${zoomValue})` }"
        id="svg-track"
      >
        <race-track2 />

        <!-- Mostrar los 9 posibles siguientes puntos -->
        <g id="next-points">
          <circle
            v-for="(point, index) in nextPoints"
            :key="'nextPoint' + index"
            :cx="point.x"
            :cy="point.y"
            r="0.4"
            fill="#8ac4f1"
            @click="clickPossiblePositions(index)"
          />
        </g>

        <!-- Dibujar círculos en los puntos de la trayectoria -->
        <!-- trayectoria -->
        <polyline :points="pathPoints" fill="none" stroke="#3881ff" stroke-width="0.3" />
        <circle
          v-for="(p, index) in path"
          :key="'circle' + index"
          :cx="p.x"
          :cy="p.y"
          r="0.25"
          fill="#3881ff"
          id="possible-points"
        />
      </svg>
    </div>

    <!---
    <div class="div-controls">
      <div class="div-buttons">
        <div>
          <Button icon="pi pi-circle" @click="move(-1, -1)" variant="text" severity="secondary" />
          <Button icon="pi pi-circle" @click="move(0, -1)" variant="text" severity="secondary" />
          <Button icon="pi pi-circle" @click="move(1, -1)" variant="text" severity="secondary" />
        </div>
        <div>
          <Button icon="pi pi-circle" @click="move(-1, 0)" variant="text" severity="secondary" />
          <Button icon="pi pi-circle" @click="move(0, 0)" variant="text" severity="secondary" />
          <Button icon="pi pi-circle" @click="move(1, 0)" variant="text" severity="secondary" />
        </div>
        <div>
          <Button icon="pi pi-circle" @click="move(-1, 1)" variant="text" severity="secondary" />
          <Button icon="pi pi-circle" @click="move(0, 1)" variant="text" severity="secondary" />
          <Button icon="pi pi-circle" @click="move(1, 1)" variant="text" severity="secondary" />
        </div>
      </div>
    </div>
    -->
  </div>

  <div class="div-controls">
    <Button icon="pi pi-plus" @click="zoomIn" />
    <Button icon="pi pi-minus" @click="zoomOut" />
    <Button icon="pi pi-bullseye" @click="centerElementInScrollView" />
  </div>
  <Dialog v-model:visible="showOutOfTrackDialog" modal header="¡Te saliste!" :closable="false">
    <p>Tu vehículo se ha salido del circuito.</p>
    <Button label="Reiniciar carrera" @click="resetGame" />
  </Dialog>

  <Dialog v-model:visible="showFinishDialog" modal header="¡Has terminado!" :closable="false">
    <p>{{ resultMessage }}</p>
    <Button
      label="Compartir en WhatsApp"
      icon="pi pi-whatsapp"
      class="p-button-success"
      @click="shareOnWhatsApp"
    />
    <Button label="Reiniciar" class="p-button-secondary mt-2" @click="resetGame" />
  </Dialog>
</template>

<style scoped>
.race-view {
  /*
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  */
  height: 100%;
  width: 100%;
  background-color: #dae8d6;
  /*padding: 10px;*/
}
.div-track {
  height: 100%;
  overflow-x: auto;
  overflow-y: auto;
  width: 100vw;
  margin-bottom: -40px;
  -webkit-overflow-scrolling: touch; /* Para iOS */
}

.div-controls {
  width: 100%;
  background-color: #dae8d5;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-bottom: 20px;
}
.div-buttons {
  padding: 10px;
  background-color: #ffffff;
  border-radius: 25px;
}

.svg-track {
  /*
  width: auto;
  height: 100%;
  */
  transform-origin: top left;
  transition: transform 0.3s ease-in-out;
}

.div-controls {
  display: flex;
  justify-content: center;
  flex-direction: row;
  position: fixed;
  bottom: env(safe-area-inset-bottom);
  background-color: transparent;
}
/* Hide devtools floating button */
.vvue-devtools__anchor--glowing {
  display: none !important;
}
</style>

<script setup lang="ts">
import { computed, ref, nextTick } from 'vue'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
//import RaceTrack from '@/components/RaceTrack.vue'
import RaceTrack2 from '@/components/RaceTrack2.vue'

//Toast Management
import { useToast } from 'primevue/usetoast'
const toast = useToast()

//Variables for movement
const position = ref({ x: 28, y: 41 })
const velocity = ref({ x: 0, y: 0 })
const path = ref([{ x: 28, y: 41 }])

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
      if (nextX >= 0 && nextX < 70 && nextY >= 0 && nextY < 50) {
        points.push({ x: nextX, y: nextY })
      }
    }
  }
  return points
})

const svgRef = ref<SVGSVGElement | null>(null)

//Execute centerElementInScrollView after the component is mounted
nextTick(() => {
  centerElementInScrollView()
})

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

const moveCount = ref(0)

function move(ax: number, ay: number) {
  const prev = { ...position.value }

  moveCount.value++

  // New Velocity
  velocity.value.x += ax
  velocity.value.y += ay

  // New Position
  position.value.x += velocity.value.x
  position.value.y += velocity.value.y

  const current = { ...position.value }

  // New position is saved in the path
  path.value.push({ ...position.value })

  if (checkFinishLineCrossed(prev, current)) {
    console.log('Finish line crossed!')
  } else {
    console.log('Finish line not crossed.')
  }

  if (checkFinishLineCrossed(prev, position.value)) {
    /*
    toast.add({
      severity: 'success',
      summary: '¡Meta alcanzada!',
      detail: `Has cruzado la línea de meta en ${moveCount.value} movimientos.`,
      life: 4000,
    })
      */
    showFinishDialog.value = true
  }

  // Check if the new position is inside the track
  isPointInsideTrack(position.value)
  //centerElementInScrollView()
}

// isPointInsideTrack(point)
// =======================================================================
// Function to calculate if the point is inside the track

const showOutOfTrackDialog = ref(false)

function isPointInsideTrack(point: { x: number; y: number }) {
  const track = document.getElementById('svg-track')
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
    /*
    toast.add({
      severity: 'contrast',
      summary: 'Outside of the track',
      detail: 'The last point moved you outside of the track',
      life: 3000,
    })
      */
    showOutOfTrackDialog.value = true
    return false
  }
}

function resetGame() {
  position.value = { x: 28, y: 41 }
  velocity.value = { x: 0, y: 0 }
  path.value = [{ x: 28, y: 41 }]
  moveCount.value = 0
  showOutOfTrackDialog.value = false
  showFinishDialog.value = false
  nextTick(() => {
    centerElementInScrollView()
  })
}

/*
Zoom and move functions
=====================================================================
*/
const zoomValue = ref(5)

async function zoomIn() {
  zoomValue.value += 1
}

async function zoomOut() {
  zoomValue.value = Math.max(0.5, zoomValue.value - 0.5) // Prevent zooming too small
}

function centerElementInScrollView() {
  const elementToCenter = document.querySelector('#next-points')
  if (!elementToCenter) {
    console.error('Element to center not found.')
    return
  }
  elementToCenter.scrollIntoView({ block: 'center', inline: 'center' })
}

;(window as any).centerElementInScrollView = centerElementInScrollView

/*
fiinish functions
=====================================================================
*/
function doLinesIntersect(p1: any, p2: any, q1: any, q2: any): boolean {
  const det = (p2.x - p1.x) * (q2.y - q1.y) - (q2.x - q1.x) * (p2.y - p1.y)
  if (det === 0) return false // Parallel

  const lambda = ((q2.y - q1.y) * (q2.x - p1.x) + (q1.x - q2.x) * (q2.y - p1.y)) / det
  const gamma = ((p1.y - p2.y) * (q2.x - p1.x) + (p2.x - p1.x) * (q2.y - p1.y)) / det

  return 0 < lambda && lambda < 1 && 0 < gamma && gamma < 1
}

function checkFinishLineCrossed(prev: { x: number; y: number }, current: { x: number; y: number }) {
  const svg = svgRef.value
  const path = svg?.getElementById('finish-line') as SVGPathElement
  if (!path || !svg) return false

  const totalLength = path.getTotalLength()
  const step = 1 // Ajusta según lo detallada que sea la línea

  // 1. Comprobar intersección con el segmento del path
  for (let i = 0; i < totalLength - step; i += step) {
    const p1 = path.getPointAtLength(i)
    const p2 = path.getPointAtLength(i + step)

    if (doLinesIntersect(prev, current, { x: p1.x, y: p1.y }, { x: p2.x, y: p2.y })) {
      return true
    }
  }

  // 2. Comprobar si el punto final cae exactamente sobre la línea
  const point = svg.createSVGPoint()
  point.x = current.x
  point.y = current.y

  // isPointInStroke es más adecuada que isPointInFill si el path es una línea
  if (typeof path.isPointInStroke === 'function') {
    return path.isPointInStroke(point)
  }

  return false
}

const showFinishDialog = ref(false)

const resultMessage = computed(
  () => `¡He terminado el circuito en ${moveCount.value} movimientos! 🏁`,
)

function shareOnWhatsApp() {
  const text = encodeURIComponent(resultMessage.value)
  const url = `https://wa.me/?text=${text}`
  window.open(url, '_blank')
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
