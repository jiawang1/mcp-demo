## widget 1
- widget: plu/job-manager
- id: job_creation_widget
- name: Job Creation
- path: createJob
- description: A widget used to create jobs

## widget 2
- widget: plu/job-manager
- id: job_editing_widget
- name: Edit Job Request
- path: editJob
- description: A widget used to edit jobs
- prerequisite
    1. requestId: (number), job request id

## widget 3
- widget: plu/job-manager
- id: job_view_widget
- name: View Job Details
- path: viewJobDetail
- description: A widget used to view job details
- prerequisite
    1. requestId: (number), job request id

## widget 4
- widget: plu/settings-center
- id: dpcs
- name: DPCS Configuration
- path: dpcs
- description: View DPCS statement or security statement

## widget 5
- widget: plu/settings-center
- id: language
- name: Change Language
- path: language
- description: Change system language

## widget 6
- widget: plu/settings-center
- id: advanced_settings
- name: Advanced Settings
- path: advanced_settings
- description: Advanced settings for personal setting

## widget 7
- widget: plu/settings-center
- id: job_run_detail
- name: Runtime Details
- path: job_run_detail
- description: view the runtime details of a specific job execution. It displays each step of the job’s runtime process, along with the corresponding execution trace, helping users analyze job performance or failures.
- prerequisite
   1. instanceId: (number) job ID

## widget 8
- widget: plu/settings-center
- id: create_audit
- name: Create Audit Report
- path: create_audit
- description: Used to generate general audit reports that track and analyze user activities, including delegation actions, page access, proxy sessions, user logins, and data export events
   
## widget 10
- widget: plu/settings-center
- id: job_request_list
- name: Job Request List
- path: job_request_list
- description: Displays job requests, either all job requests or those belonging to the current user. 
- prerequisite
   1. isOnlyMyJobs: (boolean) if only show job requests created by current or show all job requests

## widget 11
- widget: plu/settings-center
- id: job_run_list
- name: Job Runs
- path: job_run_list
- description: Displays execution trace for a job request or all runs filtered by creatorId / isOnlyMyJobs.
- prerequisite
   1. requestId: (string) Job request ID whose runs are listed

## widget 12
- widget: plu/settings-center
- id: grant_permission
- name: Check User And Permission
- path: grant_permission
- description: Assign permission to specific user.
- prerequisite
   1. userName: (string) User name
   2. permString: Permission name
