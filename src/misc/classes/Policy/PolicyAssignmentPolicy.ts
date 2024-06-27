import { Ref } from 'vue'

export default class PolicyAssignmentPolicy {
  /**
   * name of the policy
   */
  public policyName: string
  /**
   * the policy that can change its value
   */
  public policyToAssign: Ref<boolean>

  constructor (policyName: string, policyToAssign: Ref<boolean>) {
    this.policyName = policyName
    this.policyToAssign = policyToAssign
  }
}
