# Third party imports
from celery import shared_task


@shared_task
def instance_traces():
    """
    No-op task for instance tracing.
    This is a stub for the community edition where telemetry is disabled.
    """
    return
