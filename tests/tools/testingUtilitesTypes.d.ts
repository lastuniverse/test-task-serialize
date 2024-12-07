export interface TestCaseRange {
	min?: number,
	max?: number
}

export interface TestCaseOptions {
	name: string
	iterations: number
	amount?: TestCaseRange | number
	range?: TestCaseRange | number
	list?: Array<number> 
}
