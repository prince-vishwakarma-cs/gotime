import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetEventByIdQuery, useUpdateEventMutation } from "../redux/api/eventAPI";
import type { EventFormData } from '../types/eventTypes';

const formatDateForInput = (date: Date | string): string => {
  const d = new Date(date);
  const pad = (num: number) => num.toString().padStart(2, '0');
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  name: string;
  id: string;
}

const ToggleSwitch = ({ checked, onChange, name, id }: ToggleSwitchProps) => {
  return (
    <label htmlFor={id} className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        name={name}
        id={id}
        checked={checked}
        onChange={onChange}
        className="sr-only peer"
      />
      <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-gray-400 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-800"></div>
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

  const { data: eventData, isLoading: isFetching, error: fetchError } = useGetEventByIdQuery(eventId!, {
    skip: !eventId,
  });

  const [updateEvent, { isLoading: isUpdating, error: updateError }] = useUpdateEventMutation();

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
      await updateEvent({
        eventId,
        data: {
          ...formData,
          capacity: Number(formData.capacity),
        },
      }).unwrap();

      toast.success('Event updated successfully!');
      navigate(`/events/${eventId}`);
    } catch (err: any) {
      toast.error(err.data?.message || 'Failed to update event.');
    }
  };

  if (isFetching) return <div className="text-center py-24">Loading event data...</div>;
  if (fetchError) return <div className="text-center py-24 text-red-600">Error: { 'Could not load event'}</div>;

  return (
    <div className="container mx-auto py-12">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-md">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Edit Event</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Event Title</label>
            <input type="text" name="title" id="title" value={formData.title || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-800 focus:border-gray-800" required />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
            <textarea name="description" id="description" rows={4} value={formData.description || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-800 focus:border-gray-800" required />
          </div>
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</label>
            <input type="text" name="location" id="location" value={formData.location || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-800 focus:border-gray-800" required />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="start_time" className="block text-sm font-medium text-gray-700">Start Time</label>
              <input type="datetime-local" name="start_time" id="start_time" value={formData.start_time || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-800 focus:border-gray-800" required />
            </div>
            <div>
              <label htmlFor="end_time" className="block text-sm font-medium text-gray-700">End Time</label>
              <input type="datetime-local" name="end_time" id="end_time" value={formData.end_time || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-800 focus:border-gray-800" required />
            </div>
          </div>
          <div>
            <label htmlFor="capacity" className="block text-sm font-medium text-gray-700">Capacity</label>
            <input type="number" name="capacity" id="capacity" min="1" value={formData.capacity || 100} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-800 focus:border-gray-800" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Select an Image</label>
            <div className="mt-2 grid grid-cols-3 gap-4">
                {imageOptions.map((url, index) => (
                    <button type="button" key={index} onClick={() => handleImageSelect(url)} className={`relative rounded-lg overflow-hidden focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800 ${formData.image_url === url ? 'ring-2 ring-offset-2 ring-gray-800' : ''}`}>
                        <img src={url} alt={`Event image option ${index + 1}`} className="w-full h-24 object-cover" />
                        {formData.image_url === url && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            </div>
                        )}
                    </button>
                ))}
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-2">
            <div>
                <label htmlFor="is_public" className="font-medium text-gray-900">Make this event public</label>
                <p className="text-sm text-gray-500">Anyone can see and register for this event.</p>
            </div>
            <ToggleSwitch id="is_public" name="is_public" checked={!!formData.is_public} onChange={handleChange} />
          </div>

          {updateError && <p className="text-red-500 text-sm">{'Could not update event'}</p>}
          <div className="pt-4">
            <button type="submit" disabled={isUpdating} className="w-full bg-gray-900 text-white py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800 disabled:opacity-50">
              {isUpdating ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditEventPage;
