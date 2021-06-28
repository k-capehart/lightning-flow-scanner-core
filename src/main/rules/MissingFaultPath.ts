import * as rules from '../config/rules.json';
import {Flow} from '../models/Flow';
import {FlowElement} from '../models/FlowElement';
import {Rule} from '../models/Rule';

export class MissingFaultPath extends Rule{

  constructor(
  ) {
    const rule = rules.rules.find(rule => rule.name === 'MissingFaultPath');
    super(rule.name, rule.label, rule.text);
  }
    public execute(flow: Flow) {

        const typesWithFaultPath = ['recordLookups', 'recordDeletes', 'recordUpdates', 'recordCreates', 'waits', 'actionCalls'];
        const flowElementsWhereFaultPathIsApplicable: FlowElement[] = flow.nodes.filter(node => node instanceof FlowElement && typesWithFaultPath.includes(node.subtype)) as FlowElement[];
        const elementsWithoutFaultPath: FlowElement[] = [];
        for(const element of flowElementsWhereFaultPathIsApplicable){
            if(!element.connectors.find(connector => 'faultConnector' === connector.type)){
                elementsWithoutFaultPath.push(element);
            }
        }
        return elementsWithoutFaultPath;
    }
}
