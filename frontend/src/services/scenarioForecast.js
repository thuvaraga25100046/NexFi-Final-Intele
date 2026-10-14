function dayIndex(dateValue, days) {
  const date = String(dateValue).slice(0, 10)
  const firstDay = String(days[0].date).slice(0, 10)
  const dayNumber = (value) => {
    const [year, month, day] = value.split('-').map(Number)
    return Date.UTC(year, month - 1, day)
  }

  if (date <= firstDay) return 0
  return Math.round((dayNumber(date) - dayNumber(firstDay)) / 86_400_000)
}

function lowestPoint(days, balanceKey) {
  return days.reduce((lowest, day) => (
    Number(day[balanceKey]) < Number(lowest[balanceKey]) ? day : lowest
  ), days[0])
}

export function buildScenarioForecast(forecast, scenario) {
  const days = forecast?.days
  if (!Array.isArray(days) || days.length === 0) {
    throw new Error('A cash-flow forecast is required to simulate a scenario.')
  }

  const adjustments = new Array(days.length).fill(0)

  if (scenario.type === 'expense') {
    const amount = Number(scenario.amount)
    const day = Number(scenario.day)
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error('Enter an expense amount greater than zero.')
    }
    if (!Number.isInteger(day) || day < 1 || day > days.length) {
      throw new Error(`Choose a payment day from 1 to ${days.length}.`)
    }
    adjustments[day - 1] -= amount
  } else if (scenario.type === 'delay-receivable') {
    const amount = Number(scenario.receivable?.amount)
    const delayDays = Number(scenario.delayDays)
    if (!scenario.receivable || !Number.isFinite(amount) || amount <= 0) {
      throw new Error('Choose a pending receivable with a valid amount.')
    }
    if (!Number.isInteger(delayDays) || delayDays < 1 || delayDays > 60) {
      throw new Error('Choose a delay from 1 to 60 days.')
    }

    const originalIndex = dayIndex(scenario.receivable.dueDate, days)
    const delayedIndex = originalIndex + delayDays
    adjustments[originalIndex] -= amount
    if (delayedIndex < days.length) adjustments[delayedIndex] += amount
  } else {
    throw new Error('Choose a supported scenario.')
  }

  let cumulativeAdjustment = 0
  const comparison = days.map((day, index) => {
    cumulativeAdjustment += adjustments[index]
    return {
      date: day.date,
      baseline: Number(day.projectedBalance),
      scenario: Number(day.projectedBalance) + cumulativeAdjustment,
    }
  })
  const baselineLowest = lowestPoint(comparison, 'baseline')
  const scenarioLowest = lowestPoint(comparison, 'scenario')

  return {
    comparison,
    baselineClosing: comparison[comparison.length - 1].baseline,
    scenarioClosing: comparison[comparison.length - 1].scenario,
    baselineLowest: { amount: baselineLowest.baseline, date: baselineLowest.date },
    scenarioLowest: { amount: scenarioLowest.scenario, date: scenarioLowest.date },
    firstShortage: comparison.find((day) => day.scenario < 0) ?? null,
  }
}
