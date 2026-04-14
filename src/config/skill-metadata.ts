import { 
  ShieldCheck, 
  Zap, 
  Layers, 
  Terminal, 
  Workflow, 
  Database, 
  Globe, 
  GitBranch, 
  BookOpen, 
  AlertTriangle, 
  CreditCard,
  Rocket
} from 'lucide-react';

export interface SkillMetadata {
  id: string;
  title: string;
  description: string;
  icon: any;
}

export const skillMetadata: Record<string, SkillMetadata> = {
  'SKILL.md': {
    id: 'deploying-with-locus',
    title: 'PaaS Deployment',
    description: 'Guides deployment and service management via the Locus PaaS API.',
    icon: Rocket
  },
  'onboarding.md': {
    id: 'onboarding',
    title: 'Workspace Onboarding',
    description: 'Wallet detection, auth, and billing setup.',
    icon: BookOpen
  },
  'agent-quickstart.md': {
    id: 'agent-quickstart',
    title: 'Agent scripting',
    description: 'Copy-paste deploy scripts and SSE status streaming.',
    icon: Zap
  },
  'billing.md': {
    id: 'billing',
    title: 'Financial Ops',
    description: 'Credit balance, payments, and 402 handling.',
    icon: CreditCard
  },
  'deployment-workflows.md': {
    id: 'deployment-workflows',
    title: 'CI/CD Workflows',
    description: 'Deployment timing, monitoring, and rollbacks.',
    icon: Workflow
  },
  'monorepo.md': {
    id: 'monorepo',
    title: 'Monorepo Architecture',
    description: '.locusbuild file format and multi-service setup.',
    icon: Layers
  },
  'logs.md': {
    id: 'logs',
    title: 'Observability',
    description: 'Log streaming, searching, and best practices.',
    icon: Terminal
  },
  'webhooks.md': {
    id: 'webhooks',
    title: 'Reactive Logic',
    description: 'System-wide event listening and error alerts.',
    icon: Zap
  },
  'addons.md': {
    id: 'addons',
    title: 'Infrastructure Addons',
    description: 'Provision Postgres and Redis instances.',
    icon: Database
  },
  'domains.md': {
    id: 'domains',
    title: 'Domain Management',
    description: 'Custom domain and SSL orchestration.',
    icon: Globe
  },
  'git-deploy.md': {
    id: 'git-deploy',
    title: 'Git Versioning',
    description: 'Git push deploy and GitHub App integration.',
    icon: GitBranch
  },
  'api-reference.md': {
    id: 'api-reference',
    title: 'API Master',
    description: 'Complete table of all 80+ Locus API endpoints.',
    icon: Terminal
  },
  'troubleshooting.md': {
    id: 'troubleshooting',
    title: 'System Debugging',
    description: 'Platform architecture and common issue resolution.',
    icon: AlertTriangle
  },
  'checkout.md': {
    id: 'checkout',
    title: 'Payment Integration',
    description: 'USDC checkout sessions and react SDK.',
    icon: CreditCard
  }
};
