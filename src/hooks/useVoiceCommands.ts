import { useCallback } from 'react';
import { toast } from '@/hooks/use-toast';

export interface VoiceCommand {
  phrase: string;
  aliases: string[];
  description: string;
  action: string;
}

export const VOICE_COMMANDS: VoiceCommand[] = [
  {
    phrase: 'status',
    aliases: ['what is the status', 'system status', 'give me status'],
    description: 'Reads current system state',
    action: 'STATUS_CHECK',
  },
  {
    phrase: 'incident details',
    aliases: ['tell me about the incident', 'what happened', 'incident info'],
    description: 'Reads current incident summary',
    action: 'INCIDENT_DETAILS',
  },
  {
    phrase: 'approve',
    aliases: ['confirm', 'yes', 'go ahead', 'execute'],
    description: 'Approves the primary action',
    action: 'APPROVE',
  },
  {
    phrase: 'decline',
    aliases: ['cancel', 'no', 'dismiss', 'reject'],
    description: 'Cancels/dismisses current alert',
    action: 'DECLINE',
  },
  {
    phrase: 'deploy backup',
    aliases: ['send backup', 'launch backup drone', 'deploy additional'],
    description: 'Launches next available drone',
    action: 'DEPLOY_BACKUP',
  },
  {
    phrase: 'send thermal map',
    aliases: ['share thermal', 'send thermal to crews'],
    description: 'Shares thermal imagery with fire department',
    action: 'SEND_THERMAL',
  },
  {
    phrase: 'show drone',
    aliases: ['find drone', 'locate drone', 'zoom to drone'],
    description: 'Zooms to drone location',
    action: 'SHOW_DRONE',
  },
  {
    phrase: 'mark resolved',
    aliases: ['incident resolved', 'close incident', 'all clear'],
    description: 'Closes current incident',
    action: 'MARK_RESOLVED',
  },
  {
    phrase: 'what is the recommendation',
    aliases: ['why this decision', 'explain', 'ai recommendation'],
    description: 'AI explains its suggestion',
    action: 'EXPLAIN_AI',
  },
  {
    phrase: 'zoom to incident',
    aliases: ['show incident', 'go to incident', 'center on incident'],
    description: 'Centers map on active incident',
    action: 'ZOOM_INCIDENT',
  },
];

interface UseVoiceCommandsProps {
  onApprove?: () => void;
  onDecline?: () => void;
  onDeployBackup?: () => void;
  onZoomToIncident?: () => void;
  onZoomToDrone?: (droneId: string) => void;
  onMarkResolved?: () => void;
  operationalState: 'green' | 'amber' | 'red';
  activeIncident?: { title?: string; address: string; confidence?: number } | null;
  drones?: { id: string; battery: number; status: string; task?: string }[];
}

export function useVoiceCommands({
  onApprove,
  onDecline,
  onDeployBackup,
  onZoomToIncident,
  onZoomToDrone,
  onMarkResolved,
  operationalState,
  activeIncident,
  drones = [],
}: UseVoiceCommandsProps) {
  
  const processCommand = useCallback((command: string) => {
    const normalizedCommand = command.toLowerCase().trim();
    console.log(`[VOICE] Processing command: "${normalizedCommand}"`);
    
    // Find matching command
    const matchedCommand = VOICE_COMMANDS.find(vc => 
      vc.phrase === normalizedCommand || 
      vc.aliases.some(alias => normalizedCommand.includes(alias))
    );

    if (!matchedCommand) {
      console.log(`[VOICE] Command not recognized: "${normalizedCommand}"`);
      toast({
        title: "Command not recognized",
        description: `Try: "Status", "Approve", "Deploy backup"`,
        variant: "destructive",
      });
      return;
    }

    console.log(`[VOICE] Matched command: ${matchedCommand.phrase} -> ${matchedCommand.action}`);

    switch (matchedCommand.action) {
      case 'STATUS_CHECK':
        const activeDrones = drones.filter(d => d.status === 'on_mission' || d.status === 'en_route');
        const statusMessage = operationalState === 'green'
          ? `System normal. ${activeDrones.length} drones active, all zones covered.`
          : operationalState === 'amber'
            ? `Alert state. Incident detected, awaiting approval. ${activeDrones.length} drone(s) responding.`
            : `Active response. ${activeDrones.length} drones deployed, ground units en route.`;
        
        console.log(`[VOICE] Status: ${statusMessage}`);
        toast({
          title: "System Status",
          description: statusMessage,
        });
        break;

      case 'INCIDENT_DETAILS':
        if (!activeIncident) {
          console.log('[VOICE] No active incident');
          toast({
            title: "No Active Incident",
            description: "All zones are clear.",
          });
        } else {
          const details = `${activeIncident.title || 'Incident'} at ${activeIncident.address}. Confidence: ${activeIncident.confidence || 92}%`;
          console.log(`[VOICE] Incident details: ${details}`);
          toast({
            title: "Incident Details",
            description: details,
          });
        }
        break;

      case 'APPROVE':
        if (operationalState === 'amber' && onApprove) {
          console.log('[VOICE] Executing: APPROVE');
          onApprove();
          toast({
            title: "Response Approved",
            description: "Full response initiated.",
          });
        } else {
          console.log('[VOICE] Cannot approve - no pending decision');
          toast({
            title: "No Pending Decision",
            description: "Nothing to approve right now.",
            variant: "destructive",
          });
        }
        break;

      case 'DECLINE':
        if (operationalState !== 'green' && onDecline) {
          console.log('[VOICE] Executing: DECLINE');
          onDecline();
          toast({
            title: "Alert Dismissed",
            description: "Returning to monitoring.",
          });
        }
        break;

      case 'DEPLOY_BACKUP':
        console.log('[VOICE] Executing: DEPLOY_BACKUP');
        onDeployBackup?.();
        toast({
          title: "Backup Drone Deployed",
          description: "D-412 launching from Dock 2.",
        });
        break;

      case 'SEND_THERMAL':
        console.log('[VOICE] Executing: SEND_THERMAL');
        toast({
          title: "Thermal Map Sent",
          description: "Fire department received thermal imagery.",
        });
        break;

      case 'SHOW_DRONE':
        // Extract drone ID from command if present
        const droneMatch = normalizedCommand.match(/d-?(\d+)/i);
        if (droneMatch) {
          const droneId = `D-${droneMatch[1]}`;
          console.log(`[VOICE] Zooming to drone: ${droneId}`);
          onZoomToDrone?.(droneId);
          toast({
            title: `Focusing on ${droneId}`,
            description: "Map centered on drone location.",
          });
        } else {
          console.log('[VOICE] No drone ID specified');
          toast({
            title: "Specify Drone ID",
            description: 'Say "Show drone D-247"',
            variant: "destructive",
          });
        }
        break;

      case 'MARK_RESOLVED':
        console.log('[VOICE] Executing: MARK_RESOLVED');
        onMarkResolved?.();
        toast({
          title: "Incident Resolved",
          description: "Good call. Returning to normal operations.",
        });
        break;

      case 'EXPLAIN_AI':
        const explanation = activeIncident 
          ? `Heat signature of ${287}°C matches fire pattern. Wind pushing toward structures. 12 similar incidents in this area.`
          : `No active analysis. All zones are normal.`;
        console.log(`[VOICE] AI Explanation: ${explanation}`);
        toast({
          title: "AI Reasoning",
          description: explanation,
        });
        break;

      case 'ZOOM_INCIDENT':
        if (activeIncident) {
          console.log('[VOICE] Executing: ZOOM_INCIDENT');
          onZoomToIncident?.();
          toast({
            title: "Map Centered",
            description: "Focused on incident location.",
          });
        } else {
          toast({
            title: "No Active Incident",
            description: "No incident to focus on.",
            variant: "destructive",
          });
        }
        break;

      default:
        console.log(`[VOICE] Unhandled action: ${matchedCommand.action}`);
    }
  }, [operationalState, activeIncident, drones, onApprove, onDecline, onDeployBackup, onZoomToIncident, onZoomToDrone, onMarkResolved]);

  const simulateVoiceCommand = useCallback((command: string) => {
    console.log(`[VOICE] Simulating voice input: "${command}"`);
    processCommand(command);
  }, [processCommand]);

  return {
    processCommand,
    simulateVoiceCommand,
    availableCommands: VOICE_COMMANDS,
  };
}