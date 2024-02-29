import { IRuleDefinition } from '../interfaces/IRuleDefinition';
import { FlowNode } from '../models/FlowNode';
import { FlowType } from '../models/FlowType';
import { RuleCommon } from '../models/RuleCommon';
import { Compiler } from '../libs/Compiler';
import * as core from '../../index';

export class SOQLQueryInLoop extends RuleCommon implements IRuleDefinition {
  
    constructor() {
      super({
        name: 'SOQLQueryInLoop',
        label: 'SOQL Query In A Loop',
        description: "To prevent exceeding Apex governor limits, it is advisable to consolidate all your SOQL queries at the conclusion of the flow.",
        type: 'pattern',
        supportedTypes: [...FlowType.backEndTypes, ...FlowType.visualTypes],
        docRefs: [{ 'label': 'Flow Best Practices', 'path': 'https://help.salesforce.com/s/articleView?id=sf.flow_prep_bestpractices.htm&type=5' }],
        isConfigurable: false
      });
    }
  
    public execute(flow: core.Flow): core.RuleResult {
      if (flow.type[0] === 'Survey') {
        return new core.RuleResult(this, []);
      }
  
      const dmlStatementTypes = ['recordLookups'];
      const loopElements: FlowNode[] = flow.elements.filter(node => node.subtype === 'loops') as FlowNode[];
      const dmlStatementsInLoops: FlowNode[] = [];
      const compiler = new Compiler();
  
      // Check if a DML statement is inside a loop
      for (const loopElement of loopElements) {
        const startOfLoop = loopElement;
  
        compiler.traverseFlow(flow, loopElement.name, (element) => {
          if (dmlStatementTypes.includes(element.subtype) && compiler.isInLoop(flow, element, startOfLoop)) {
            dmlStatementsInLoops.push(element);
          }
        });
      }
  
      let results = [];
      for (const det of dmlStatementsInLoops) {
        results.push(new core.ResultDetails(det));
      }
  
      return new core.RuleResult(this, results);
    }
  }
  