import { z } from 'zod';

export const LocalStepSchema = z.object({
  name: z.string(),
  run: z.string(),
});

export const AdapterStepSchema = z.object({
  name: z.string(),
  adapter: z.string(),
  action: z.string(),
  options: z.record(z.unknown()).optional(),
});

export const StepSchema = z.union([LocalStepSchema, AdapterStepSchema]);

export const WorkflowSchema = z.object({
  when: z.string(),
  steps: z.array(StepSchema),
});

export const GlueConfigSchema = z.record(WorkflowSchema);

export type LocalStep = z.infer<typeof LocalStepSchema>;
export type AdapterStep = z.infer<typeof AdapterStepSchema>;
export type Step = z.infer<typeof StepSchema>;
export type Workflow = z.infer<typeof WorkflowSchema>;
export type GlueConfig = z.infer<typeof GlueConfigSchema>;

export interface WorkflowExecutionResult {
  success: boolean;
  stepResults: StepResult[];
  error?: string;
}

export interface StepResult {
  stepName: string;
  success: boolean;
  output?: string;
  error?: string;
  duration: number;
}