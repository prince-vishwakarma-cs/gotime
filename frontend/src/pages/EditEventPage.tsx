import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetEventByIdQuery, useUpdateEventMutation } from "../redux/api/eventAPI";
import type { EventFormData } from '../types/eventTypes';
import { Calendar } from 'lucide-react';

const formatDateForInput = (date: Date | string): string => {
  const d = new Date(date);
  if (isNaN(d.getTime())) return ''; // Return empty if date is invalid
  const pad = (num: number) => num.toString().padStart(2, '0');
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

// --- Themed ToggleSwitch ---
const ToggleSwitch = ({ checked, onChange, name, id }: {
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  name: string;
  id: string;
}) => {
  return (
    <label htmlFor={id} className="relative inline-flex items-center cursor-pointer">
      <input type="checkbox" name={name} id={id} checked={checked} onChange={onChange} className="sr-only peer" />
      <div className="w-11 h-6 rounded-full transition-colors duration-200 bg-card-background border border-button-border peer-checked:bg-primary-button-background peer-focus:ring-2 peer-focus:ring-primary-button-background/50 peer-focus:ring-offset-2 peer-focus:ring-offset-primary-background after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:h-5 after:w-5 after:rounded-full after:bg-primary-button-text after:transition-all peer-checked:after:translate-x-full"></div>
    </label>
  );
};

const imageOptions = [
    'https://images.pexels.com/photos/33242508/pexels-photo-33242508/free-photo-of-elegant-wedding-invitation-with-floral-bouquet.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    'https://images.pexels.com/photos/17229131/pexels-photo-17229131/free-photo-of-restaurant-table-decorated-with-red-vases-filled-with-flowers.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    'https://images.pexels.com/photos/7648221/pexels-photo-7648221.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    'https://images.pexels.com/photos/8761559/pexels-photo-8761559.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    'https://images.pexels.com/photos/1943411/pexels-photo-1943411.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    'https://images.pexels.com/photos/21413075/pexels-photo-21413075/free-photo-of-fireworks-show-over-the-stage.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
];

const EditEventPage = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();

  const { data: eventData, isLoading: isFetching, error: fetchError } = useGetEventByIdQuery(eventId!, { skip: !eventId });
  const [updateEvent, { isLoading: isUpdating }] = useUpdateEventMutation();
  const [formData, setFormData] = useState<Partial<EventFormData>>({});

  useEffect(() => {
    if (eventData?.event) {
      const { event } = eventData;
      setFormData({
        title: event.title,
        description: event.description,
        location: event.location,
        start_time: formatDateForInput(event.start_time),
        end_time: formatDateForInput(event.end_time),
        capacity: event.capacity,
        is_public: event.is_public,
        image_url: event.image_url || imageOptions[0],
      });
    }
  }, [eventData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
        const { checked } = e.target as HTMLInputElement;
        setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleImageSelect = (url: string) => {
    setFormData(prev => ({ ...prev, image_url: url }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventId) return;
    try {
      await updateEvent({ eventId, data: { ...formData, capacity: Number(formData.capacity) } }).unwrap();
      toast.success('Event updated successfully!');
      navigate(`/events/${eventId}`);
    } catch (err: any) {
      toast.error(err.data?.message || 'Failed to update event.');
    }
  };

  // --- UI States ---
  if (isFetching) return <div className="text-center text-primary-text py-24">Loading event data...</div>;
  if (fetchError) return <div className="text-center py-24 text-red-400">Error: Could not load event data.</div>;

  // --- Themed Styles ---
  const inputStyles = "mt-1 block w-full px-3 py-2 text-primary-text bg-card-background rounded-lg outline-none border border-button-border focus:ring-2 focus:ring-primary-button-background/50";
  const primaryButtonStyles = "w-full bg-primary-button-background text-primary-button-text py-3 px-4 rounded-full text-lg font-semibold hover:bg-primary-button-hover-background transition-colors disabled:opacity-50";

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-primary-text">
      <div className="max-w-3xl mx-auto bg-card-background border border-border p-6 sm:p-8 rounded-xl shadow-md">
        <h1 className="text-3xl font-bold mb-8">Edit Event</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div>
            <label htmlFor="title" className="block text-sm font-medium">Event Title</label>
            <input type="text" name="title" id="title" value={formData.title || ''} onChange={handleChange} className={inputStyles} required />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium">Description</label>
            <textarea name="description" id="description" rows={4} value={formData.description || ''} onChange={handleChange} className={inputStyles} required />
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium">Location</label>
            <input type="text" name="location" id="location" value={formData.location || ''} onChange={handleChange} className={inputStyles} required />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="start_time" className="block text-sm font-medium">Start Time</label>
              <div className="relative mt-1">
                <input type="datetime-local" name="start_time" id="start_time" value={formData.start_time || ''} onChange={handleChange} className={`${inputStyles} pr-10 [&::-webkit-calendar-picker-indicator]:hidden`} required />
                <Calendar className="absolute top-1/2 right-3 -translate-y-1/2 h-5 w-5 text-secondary-text pointer-events-none" />
              </div>
            </div>
            <div>
              <label htmlFor="end_time" className="block text-sm font-medium">End Time</label>
              <div className="relative mt-1">
                <input type="datetime-local" name="end_time" id="end_time" value={formData.end_time || ''} onChange={handleChange} className={`${inputStyles} pr-10 [&::-webkit-calendar-picker-indicator]:hidden`} required />
                <Calendar className="absolute top-1/2 right-3 -translate-y-1/2 h-5 w-5 text-secondary-text pointer-events-none" />
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="capacity" className="block text-sm font-medium">Capacity</label>
            <input type="number" name="capacity" id="capacity" min="1" value={formData.capacity || 1} onChange={handleChange} className={`${inputStyles} hide-arrows`} required />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Select an Image</label>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {imageOptions.map((url) => (
                <button type="button" key={url} onClick={() => handleImageSelect(url)} className={`relative rounded-lg overflow-hidden focus:outline-none ring-2 ring-offset-2 ring-offset-card-background transition-all ${formData.image_url === url ? 'ring-primary-button-background' : 'ring-transparent'}`}>
                  <img src={url} alt="Event image option" className="w-full h-20 sm:h-24 object-cover" />
                  {formData.image_url === url && <div className="absolute inset-0 bg-black/60 flex items-center justify-center"><svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg></div>}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-2">
            <div>
              <label htmlFor="is_public" className="font-medium text-primary-text">Make this event public</label>
              <p className="text-sm text-secondary-text">Anyone can see and register for this event.</p>
            </div>
            <ToggleSwitch id="is_public" name="is_public" checked={!!formData.is_public} onChange={handleChange} />
          </div>

          <div className="pt-4">
            <button type="submit" disabled={isUpdating} className={primaryButtonStyles}>
              {isUpdating ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditEventPage;