import PolicyAssignmentPolicy from 'src/misc/classes/Policy/PolicyAssignmentPolicy'

export default function AssignPolicies (policies: PolicyAssignmentPolicy[], availablePolicies: { policy: string }[]) {
  for (let i = 0; i < availablePolicies.length; i++) {
    if (policies.findIndex((policy) => policy.policyName === availablePolicies[i].policy) > -1) {
      // set the policy to true
      const policyIndex = policies.findIndex((policy) => policy.policyName === availablePolicies[i].policy)
      policies[policyIndex].policyToAssign.value = true
    }
  }
}
