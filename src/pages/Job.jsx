import { useEffect } from "react";
import { BarLoader } from "react-spinners";
import MDEditor from "@uiw/react-md-editor";
import { useParams } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { Briefcase, DoorClosed, DoorOpen, MapPinIcon } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ApplyJobDrawer } from "@/components/apply-job";
import ApplicationCard from "@/components/application-card";

import useFetch from "@/hooks/use-fetch";
import { getSingleJob, updateHiringStatus } from "@/api/apiJobs";

const JobPage = () => {
  const { id } = useParams();
  const { isLoaded, user } = useUser();

  const {
    loading: loadingJob,
    data: job,
    fn: fnJob,
  } = useFetch(getSingleJob, {
    job_id: id,
  });

  useEffect(() => {
    if (isLoaded) fnJob();
  }, [isLoaded]);

  const { loading: loadingHiringStatus, fn: fnHiringStatus } = useFetch(
    updateHiringStatus,
    {
      job_id: id,
    }
  );

  const handleStatusChange = (value) => {
    const isOpen = value === "open";
    fnHiringStatus(isOpen).then(() => fnJob());
  };

  if (!isLoaded || loadingJob) {
    return (
      <div className="flex justify-center items-center min-h-screen px-4">
        <BarLoader className="mb-4" width={"100%"} color="#36d7b7" />
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto py-8">
        <div className="flex flex-col gap-8 mt-5">
          {/* Header Section */}
          <div className="flex flex-col-reverse gap-6 md:flex-row justify-between items-center">
            <h1 className="gradient-title font-extrabold pb-3 text-4xl sm:text-6xl">
              {job?.title}
            </h1>
            <img src={job?.company?.logo_url} className="h-12" alt={job?.title} />
          </div>

          {/* Job Info Section */}
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="flex items-center gap-2">
              <MapPinIcon className="w-5 h-5" />
              <span>{job?.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              <span>{job?.applications?.length} Applicants</span>
            </div>
            <div className="flex items-center gap-2">
              {job?.isOpen ? (
                <>
                  <DoorOpen className="w-5 h-5" />
                  <span>Open</span>
                </>
              ) : (
                <>
                  <DoorClosed className="w-5 h-5" />
                  <span>Closed</span>
                </>
              )}
            </div>
          </div>

          {/* Hiring Status Selector for Recruiters */}
          {job?.recruiter_id === user?.id && (
            <Select onValueChange={handleStatusChange}>
              <SelectTrigger
                className={`w-full ${job?.isOpen ? "bg-green-950" : "bg-red-950"}`}
              >
                <SelectValue
                  placeholder={
                    "Hiring Status " + (job?.isOpen ? "( Open )" : "( Closed )")
                  }
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          )}

          {/* About Section */}
          <div className="space-y-4">
            <h2 className="text-2xl sm:text-3xl font-bold">About the job</h2>
            <p className="sm:text-lg">
              {job?.description}
            </p>
          </div>

          {/* Requirements Section */}
          <div className="space-y-4">
            <h2 className="text-2xl sm:text-3xl font-bold">
              What we are looking for
            </h2>
            <MDEditor.Markdown
              source={job?.requirements}
              className="bg-transparent sm:text-lg"
            />
          </div>

          {/* Apply Button for Candidates */}
          {job?.recruiter_id !== user?.id && (
            <ApplyJobDrawer
              job={job}
              user={user}
              fetchJob={fnJob}
              applied={job?.applications?.find((ap) => ap.candidate_id === user.id)}
            />
          )}

          {/* Loading Indicator */}
          {loadingHiringStatus && <BarLoader width={"100%"} color="#36d7b7" />}

          {/* Applications Section for Recruiters */}
          {job?.applications?.length > 0 && job?.recruiter_id === user?.id && (
            <div className="flex flex-col gap-2">
              <h2 className="font-bold mb-4 text-xl ml-1">Applications</h2>
              {job?.applications.map((application) => {
                return (
                  <ApplicationCard key={application.id} application={application} />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobPage;