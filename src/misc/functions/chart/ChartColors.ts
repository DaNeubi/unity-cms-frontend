import { colors } from 'quasar'
const { getPaletteColor } = colors

function AvailableChartColors () : string[] {
  const colors = ['red-9', 'red-10', 'pink-9', 'pink-10', 'purple-9', 'purple-10', 'deep-purple-9', 'deep-purple-10', 'indigo-9', 'indigo-10', 'blue-9', 'blue-10', 'light-blue-9', 'light-blue-10', 'cyan-9', 'cyan-10', 'teal-9', 'teal-10', 'green-9', 'green-10', 'light-green-9', 'light-green-10', 'lime-9', 'lime-10', 'yellow-9', 'yellow-10', 'amber-9', 'amber-10', 'orange-9', 'orange-10', 'deep-orange-9', 'deep-orange-10', 'brown-9', 'brown-10', 'grey-9', 'grey-10', 'blue-grey-9', 'blue-grey-10']
  const availableColors: string[] = []
  colors.forEach(color => {
    const cssVar = getPaletteColor(color)
    if (cssVar) {
      availableColors.push(cssVar)
    }
  })
  return shuffleArray(shuffleArray(availableColors))
}

// Fisher-Yates shuffle
function shuffleArray (array: string[]) : string[] {
  let currentIndex = array.length
  let temporaryValue: string
  let randomIndex: number

  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex -= 1
    temporaryValue = array[currentIndex]
    array[currentIndex] = array[randomIndex]
    array[randomIndex] = temporaryValue
  }

  return [...array]
}

export default AvailableChartColors
